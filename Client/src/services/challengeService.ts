import { format, differenceInDays, parseISO } from 'date-fns';
import type { Task, Challenge, HistoryRecord } from '../types/index';
import { generateId } from '../utils/id';

/**
 * Calculates the current day index of a challenge, respecting its refresh time.
 */
export const calculateTodayIndex = (challenge: Challenge | null): number => {
    if (!challenge) return 0;

    const now = new Date();
    const [refHours, refMins] = (challenge.refreshTime || "00:00").split(':').map(Number);

    const shiftedNow = new Date(now.getTime());
    shiftedNow.setHours(shiftedNow.getHours() - refHours);
    shiftedNow.setMinutes(shiftedNow.getMinutes() - refMins);

    return differenceInDays(shiftedNow, parseISO(challenge.startDate)) + 1;
};

/**
 * Toggles a routine task for a specific day and updates the challenge progress.
 */
export const toggleRoutineTaskLogic = (
    challenge: Challenge,
    day: number,
    taskIndex: number,
    todayIndex: number
): Partial<Challenge> | null => {
    // RULE: Strict Mode - Only allow editing for the current calendar day.
    if (day !== todayIndex) return null;

    const currentDayProgress = challenge.dailyProgress[day] || [];
    const newDayProgress = [...currentDayProgress];

    // Ensure array is long enough
    if (newDayProgress.length <= taskIndex) {
        for (let i = newDayProgress.length; i <= taskIndex; i++) {
            newDayProgress[i] = false;
        }
    }

    newDayProgress[taskIndex] = !newDayProgress[taskIndex];

    const updatedProgress = {
        ...challenge.dailyProgress,
        [day]: newDayProgress
    };

    // Check if ALL VISIBLE tasks for the day are done
    const allTasksCompleted = challenge.dailyRoutine.every((task, idx) => {
        const addedOn = task.addedOnDay || 1;
        const removedOn = task.removedOnDay || Infinity;
        const isVisible = day >= addedOn && day < removedOn;

        if (!isVisible) return true;
        return newDayProgress[idx] === true;
    });

    let newCompletedDays = challenge.completedDays;
    if (allTasksCompleted) {
        if (!newCompletedDays.includes(day)) newCompletedDays = [...newCompletedDays, day];
    } else {
        newCompletedDays = newCompletedDays.filter(d => d !== day);
    }

    return {
        dailyProgress: updatedProgress,
        completedDays: newCompletedDays
    };
};

/**
 * Prepares the challenge state for a reset to Day 1.
 */
export const resetChallengeLogic = (challenge: Challenge, todayIndex: number): Partial<Challenge> => {
    const flattenedRoutine = challenge.dailyRoutine
        .filter(t => !t.removedOnDay || t.removedOnDay > todayIndex)
        .map(t => ({
            ...t,
            addedOnDay: 1,
            removedOnDay: undefined
        }));

    const newHistoryRecord: HistoryRecord = {
        id: generateId(),
        type: 'edit',
        taskId: 'challenge-reset',
        taskText: 'Reset Challenge',
        timestamp: Date.now(),
        details: 'Challenge was reset to Day 1'
    };

    return {
        startDate: format(new Date(), 'yyyy-MM-dd'),
        completedDays: [],
        dailyProgress: {},
        dailyRoutine: flattenedRoutine,
        history: [newHistoryRecord, ...(challenge.history || [])]
    };
};

/**
 * Calculates high-level progress metrics for the challenge.
 */
export const calculateStats = (challenge: Challenge | null, todayIndex: number) => {
    if (!challenge) return { completed: 0, consistency: 0, daysLeft: 0 };

    const daysElapsed = Math.max(1, Math.min(challenge.days, todayIndex));
    const consistency = Math.round((challenge.completedDays.length / daysElapsed) * 100);
    const daysRemaining = Math.max(0, challenge.days - todayIndex + 1);

    return {
        completed: challenge.completedDays.length,
        consistency: isNaN(consistency) ? 0 : consistency,
        daysLeft: daysRemaining
    };
};

/**
 * Determines the visual style for a day cell in the progress map.
 */
export const getProgressStyleLogic = (challenge: Challenge | null, day: number): string => {
    if (!challenge) return '';
    const isStrict = challenge.dailyRoutine.length > 0;

    if (!isStrict) {
        const isCompleted = challenge.completedDays.includes(day);
        return isCompleted
            ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-800 dark:text-cyan-200/80 shadow-[0_0_15px_-4px_rgba(34,211,238,0.3)]'
            : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-400';
    }

    const progress = challenge.dailyProgress[day] || [];
    let completedCount = 0;
    let totalCount = 0;

    challenge.dailyRoutine.forEach((task, idx) => {
        const addedOn = task.addedOnDay || 1;
        const removedOn = task.removedOnDay || Infinity;
        const isVisible = day >= addedOn && day < removedOn;

        if (isVisible) {
            totalCount++;
            if (progress[idx]) completedCount++;
        }
    });

    if (totalCount === 0) return 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-400';

    const percentage = (completedCount / totalCount) * 100;

    if (percentage === 0) return 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-400';
    if (percentage === 100) return 'bg-cyan-500/40 border-cyan-600 dark:border-cyan-400 text-cyan-900 dark:text-cyan-100 shadow-[0_0_15px_-4px_rgba(34,211,238,0.5)]';
    if (percentage < 30) return 'bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-200/60';
    if (percentage < 70) return 'bg-orange-500/10 border-orange-500/20 text-orange-900 dark:text-orange-200/60';
    return 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200/60';
};

/**
 * Calculates completion statistics for each task in the daily routine.
 */
export const calculateTaskStats = (challenge: Challenge | null) => {
    const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444'];
    if (!challenge || challenge.dailyRoutine.length === 0) return [];

    const counts = new Array(challenge.dailyRoutine.length).fill(0);
    let totalCompletions = 0;

    Object.values(challenge.dailyProgress).forEach(dayTasks => {
        dayTasks.forEach((isDone, idx) => {
            if (isDone) {
                counts[idx]++;
                totalCompletions++;
            }
        });
    });

    return challenge.dailyRoutine.map((task, idx) => ({
        name: task.text,
        count: counts[idx],
        percentage: totalCompletions > 0 ? (counts[idx] / totalCompletions) * 100 : 0,
        color: CHART_COLORS[idx % CHART_COLORS.length]
    })).sort((a, b) => b.count - a.count);
};

/**
 * Gets progress statistics for a specific day.
 */
export const calculateDayStats = (challenge: Challenge | null, day: number | null) => {
    if (!challenge || day === null) return { total: 0, completed: 0 };
    const progress = challenge.dailyProgress[day] || [];
    let completed = 0;
    let total = 0;

    challenge.dailyRoutine.forEach((t, i) => {
        const visible = day >= (t.addedOnDay || 1) && day < (t.removedOnDay || Infinity);
        if (visible) {
            total++;
            if (progress[i]) completed++;
        }
    });

    return { total, completed };
};

/**
 * Tracks changes and prepares updated settings for the challenge.
 */
export const getSettingsUpdate = (
    challenge: Challenge,
    newTitle: string,
    newDescription: string,
    newRefreshTime: string
): Partial<Challenge> | null => {
    const changes: string[] = [];
    if (challenge.title !== newTitle) changes.push(`Renamed challenge to "${newTitle}"`);
    if ((challenge.description || '') !== newDescription) changes.push(`Updated description`);
    if (challenge.refreshTime !== newRefreshTime) changes.push(`Shifted refresh time to ${newRefreshTime}`);

    if (changes.length === 0) return null;

    const newHistory: HistoryRecord = {
        id: generateId(),
        type: 'edit',
        taskId: 'challenge-settings',
        taskText: challenge.title,
        timestamp: Date.now(),
        details: `Settings updated: ${changes.join(', ')}`
    };

    return {
        title: newTitle,
        description: newDescription,
        refreshTime: newRefreshTime,
        history: [newHistory, ...(challenge.history || [])]
    };
};

/**
 * Handles the logic for saving/editing a protocol task (either an override for a specific day or a global routine update).
 */
export const handleProtocolTaskSaveLogic = (
    challenge: Challenge,
    taskData: Partial<Task>,
    selectedDate: Date
): Partial<Challenge> => {
    const diff = differenceInDays(selectedDate, parseISO(challenge.startDate)) + 1;

    if (taskData.id && taskData.id.startsWith('protocol-')) {
        const idx = parseInt(taskData.id.split('-')[1]);
        const original = challenge.dailyRoutine[idx];
        const currentOverride = challenge.dailyOverrides?.[diff]?.[idx];

        const currentText = currentOverride?.text || original.text;
        const currentTime = currentOverride?.time || original.time;

        const newText = taskData.text || currentText;
        const newTime = taskData.scheduledTime || currentTime;

        const changes: string[] = [];
        if (currentText !== newText) changes.push(`renamed "${currentText}" to "${newText}"`);
        if (currentTime !== newTime) changes.push(`changed time from ${currentTime || 'Anytime'} to ${newTime || 'Anytime'}`);

        const updatedOverrides = { ...(challenge.dailyOverrides || {}) };
        if (!updatedOverrides[diff]) updatedOverrides[diff] = {};
        updatedOverrides[diff][idx] = {
            text: newText,
            time: newTime
        };

        const newHistory: HistoryRecord = {
            id: generateId(),
            type: 'edit',
            taskId: taskData.id,
            taskText: newText,
            timestamp: Date.now(),
            details: changes.length > 0
                ? `Day ${diff} adjustment: ${changes.join(' and ')}`
                : `Day ${diff} specific: No visible changes recorded`
        };

        return {
            dailyOverrides: updatedOverrides,
            history: [newHistory, ...(challenge.history || [])]
        };
    } else {
        const newRoutineItem = {
            id: generateId(),
            text: taskData.text || 'Untitled Protocol',
            time: taskData.scheduledTime,
            addedOnDay: Math.max(1, diff)
        };
        const updatedRoutine = [...challenge.dailyRoutine, newRoutineItem];

        const newHistory: HistoryRecord = {
            id: generateId(),
            type: 'add',
            taskId: newRoutineItem.id,
            taskText: newRoutineItem.text,
            timestamp: Date.now(),
            details: `New global task: "${newRoutineItem.text}" scheduled for ${newRoutineItem.time || 'Anytime'} (Effective Day ${newRoutineItem.addedOnDay}+)`
        };

        return {
            dailyRoutine: updatedRoutine,
            history: [newHistory, ...(challenge.history || [])]
        };
    }
};

/**
 * Handles the logic for deleting a protocol task from the routine.
 */
export const handleProtocolTaskDeleteLogic = (
    challenge: Challenge,
    id: string
): Partial<Challenge> => {
    const idx = parseInt(id.split('-')[1]);
    const updatedRoutine = challenge.dailyRoutine.filter((_, i) => i !== idx);

    const updatedProgress: Record<number, boolean[]> = {};
    Object.entries(challenge.dailyProgress).forEach(([day, progress]) => {
        updatedProgress[Number(day)] = (progress as any).filter((_: any, i: any) => i !== idx);
    });

    const taskToDelete = challenge.dailyRoutine[idx];
    const newHistory: HistoryRecord = {
        id: generateId(),
        type: 'delete',
        taskId: id,
        taskText: taskToDelete.text,
        timestamp: Date.now(),
        details: `Deleted protocol task: ${taskToDelete.text}`
    };

    const isRoutineEmpty = updatedRoutine.length === 0;

    return {
        dailyRoutine: updatedRoutine,
        dailyProgress: isRoutineEmpty ? {} : updatedProgress,
        completedDays: isRoutineEmpty ? [] : challenge.completedDays,
        history: [newHistory, ...(challenge.history || [])]
    };
};

