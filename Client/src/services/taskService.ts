import { format, differenceInDays, parseISO } from 'date-fns';
import type { Task, Challenge } from '../types/index';

/**
 * Calculates the effective date by applying the challenge's refresh offset.
 */
export const getEffectiveDate = (date: Date, activeChallenge: Challenge | null): Date => {
    if (!activeChallenge || !activeChallenge.refreshTime) return date;
    const [refHours, refMins] = activeChallenge.refreshTime.split(':').map(Number);
    const shifted = new Date(date.getTime());
    shifted.setHours(shifted.getHours() - refHours);
    shifted.setMinutes(shifted.getMinutes() - refMins);
    return shifted;
};

/**
 * Extracts unique, sorted scheduled dates for regular tasks from today onwards.
 */
export const getNormalTaskDates = (tasks: Task[], today: Date): Date[] => {
    return Array.from(new Set(
        tasks
            .filter(t => t.scheduledDate && new Date(t.scheduledDate) >= today)
            .map(t => t.scheduledDate!)
    )).map(dateStr => {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d;
    }).sort((a, b) => a.getTime() - b.getTime());
};

/**
 * Calculates dates within the active challenge period from today onwards.
 */
export const getDisciplineDates = (activeChallenge: Challenge | null, today: Date): Date[] => {
    const disciplineDates: Date[] = [];
    if (activeChallenge && activeChallenge.startDate) {
        const start = parseISO(activeChallenge.startDate);
        for (let i = 0; i < activeChallenge.days; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);
            if (d >= today) {
                disciplineDates.push(d);
            }
        }
    }
    return disciplineDates;
};

/**
 * Merges regular and protocol tasks for a specific day view.
 */
export const getDayTasksLogic = (
    tasks: Task[],
    date: Date,
    activeChallenge: Challenge | null,
    taskTypeFilter: 'normal' | 'disciplined'
): Task[] => {
    const dayDateStr = format(date, 'yyyy-MM-dd');
    const diff = activeChallenge ? differenceInDays(date, parseISO(activeChallenge.startDate)) + 1 : 0;
    const isProtocolDay = activeChallenge && diff >= 1 && diff <= activeChallenge.days;

    const regularTasksForDay = tasks.filter(t => t.scheduledDate === dayDateStr);

    const protocolTasks = isProtocolDay ? activeChallenge!.dailyRoutine
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => {
            const addedOn = item.addedOnDay || 1;
            const removedOn = item.removedOnDay || Infinity;
            return diff >= addedOn && diff < removedOn;
        })
        .map(({ item, idx }) => {
            const override = activeChallenge!.dailyOverrides?.[diff]?.[idx];
            return {
                id: `protocol-${idx}`,
                text: override?.text || item.text,
                completed: activeChallenge!.dailyProgress[diff]?.[idx] || false,
                scheduledDate: dayDateStr,
                scheduledTime: override?.time || item.time,
                isProtocol: true,
                protocolIdx: idx
            } as Task;
        }) : [];

    const result = (taskTypeFilter === 'normal' ? regularTasksForDay : protocolTasks);
    
    return result.sort((a, b) => {
        const timeA = a.scheduledTime || '99:99';
        const timeB = b.scheduledTime || '99:99';
        return timeA.localeCompare(timeB);
    });
};
