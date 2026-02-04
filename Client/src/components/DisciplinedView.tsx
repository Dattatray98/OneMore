import React, { useState, useEffect } from 'react';
import { Target, Trophy, CheckCircle2, Clock, Settings, Save, Zap, Calendar, TrendingUp, BarChart3, Plus, Edit2, Trash2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import type { Challenge } from '../types';

interface DisciplinedViewProps {
    challenge: Challenge | null;
    onUpdateChallenge: (challenge: Challenge | null) => void;
    onNavigateToPlanner?: (filter: 'normal' | 'disciplined', view: 'week' | 'day') => void;
    onNavigateToPomodoro?: () => void;
}

export const DisciplinedView: React.FC<DisciplinedViewProps> = ({ challenge, onUpdateChallenge, onNavigateToPlanner, onNavigateToPomodoro }) => {
    //Creation Form State: Temporary state while user is building a new challenge.

    // 2. Creation Form State: Temporary state while user is building a new challenge.
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dailyRoutine, setDailyRoutine] = useState<{ id: string; text: string; time?: string }[]>([]);
    const [newTask, setNewTask] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [daysInput, setDaysInput] = useState('30');
    const [refreshTime, setRefreshTime] = useState('00:00');
    const [isCreating, setIsCreating] = useState(false);

    // 3. UI Interaction State
    const [selectedDay, setSelectedDay] = useState<number | null>(null); // Currently viewed day in the dashboard
    const [isEditing, setIsEditing] = useState(false); // Toggle for settings mode
    const [editRefreshTime, setEditRefreshTime] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Derived State for Current Day
    // Derived State for Current Day (Respecting Refresh Time)
    const todayIndex = (() => {
        if (!challenge) return 0;

        const now = new Date();
        const [refHours, refMins] = (challenge.refreshTime || "00:00").split(':').map(Number);

        // Calculate the "Relative Now": Subtract the refresh offset so that the day 
        // only "rolls over" once the wall clock passes the refresh time.
        const shiftedNow = new Date(now.getTime());
        shiftedNow.setHours(shiftedNow.getHours() - refHours);
        shiftedNow.setMinutes(shiftedNow.getMinutes() - refMins);

        return differenceInDays(shiftedNow, parseISO(challenge.startDate)) + 1;
    })();

    // Auto-select current day on load
    useEffect(() => {
        if (challenge && selectedDay === null) {
            const currentDay = Math.max(1, Math.min(todayIndex, challenge.days));
            setSelectedDay(currentDay);
        }
    }, [challenge, todayIndex]);

    const handleCreateChallenge = (e: React.FormEvent) => {
        e.preventDefault();
        const days = parseInt(daysInput);
        if (days < 1) return;

        const newChallenge: Challenge = {
            id: crypto.randomUUID(),
            title: title || 'New Discipline Challenge',
            description,
            dailyRoutine,
            days,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            completedDays: [],
            dailyProgress: {},
            refreshTime,
            history: []
        };

        onUpdateChallenge(newChallenge);
        setIsCreating(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDailyRoutine([]);
        setDaysInput('30');
        setRefreshTime('00:00');
    };

    const addRoutineTask = () => {
        if (!newTask.trim()) return;
        setDailyRoutine([...dailyRoutine, {
            id: crypto.randomUUID(),
            text: newTask.trim(),
            time: newTaskTime || undefined
        }]);
        setNewTask('');
        setNewTaskTime('');
    };

    const removeRoutineTask = (index: number) => {
        setDailyRoutine(dailyRoutine.filter((_, i) => i !== index));
    };



    // CORE LOGIC: Task Toggling
    // =========================
    // This function handles checking/unchecking a task for a specific day.
    // It enforces "Strict Mode" (only today can be edited) and updates progress/completion status.
    const toggleRoutineTask = (day: number, taskIndex: number) => {
        if (!challenge) return;

        // RULE: Strict Mode - Only allow editing for the current calendar day.
        // Prevent cheating by modifying past days or pre-filling future days.
        if (day !== todayIndex) {
            // Logic blocked. Visual feedback is handled in the JSX (cursor-not-allowed).
            return;
        }

        // 1. Get current progress for this day (or init if empty)
        const currentDayProgress = challenge.dailyProgress[day] || new Array(challenge.dailyRoutine.length).fill(false);
        const newDayProgress = [...currentDayProgress];

        // 2. Toggle the specific task
        newDayProgress[taskIndex] = !newDayProgress[taskIndex];

        // 3. Update the big progress map
        const updatedProgress = {
            ...challenge.dailyProgress,
            [day]: newDayProgress
        };

        // 4. Check if ALL tasks for the day are now done
        const allTasksCompleted = newDayProgress.length === challenge.dailyRoutine.length && newDayProgress.every(done => done);

        // 5. Update "Completed Days" list (The Green Streak)
        // If all done, add day to list. If not, remove it.
        let newCompletedDays = challenge.completedDays;
        if (allTasksCompleted) {
            if (!newCompletedDays.includes(day)) newCompletedDays = [...newCompletedDays, day];
        } else {
            newCompletedDays = newCompletedDays.filter(d => d !== day);
        }

        // 6. Save everything
        updateChallengeState({
            dailyProgress: updatedProgress,
            completedDays: newCompletedDays
        });
    };

    const updateChallengeState = (updates: Partial<Challenge>) => {
        if (!challenge) return;
        const updatedChallenge = { ...challenge, ...updates };
        onUpdateChallenge(updatedChallenge);
    };

    const resetChallenge = () => {
        if (confirm('Are you sure you want to start over?')) {
            onUpdateChallenge(null);
            setSelectedDay(null);
        }
    }

    const startEditing = () => {
        if (!challenge) return;
        setEditTitle(challenge.title);
        setEditDescription(challenge.description || '');
        setEditRefreshTime(challenge.refreshTime);
        setIsEditing(true);
    }

    const saveSettings = () => {
        if (!challenge) return;

        const changes: string[] = [];
        if (challenge.title !== editTitle) {
            changes.push(`Renamed challenge to "${editTitle}"`);
        }
        if ((challenge.description || '') !== editDescription) {
            changes.push(`Updated description`);
        }
        if (challenge.refreshTime !== editRefreshTime) {
            changes.push(`Shifted refresh time to ${editRefreshTime}`);
        }

        if (changes.length === 0) {
            setIsEditing(false);
            return;
        }

        const newHistory: any = {
            id: crypto.randomUUID(),
            type: 'edit',
            taskId: 'challenge-settings',
            taskText: challenge.title,
            timestamp: Date.now(),
            details: `Settings updated: ${changes.join(', ')}`
        };

        onUpdateChallenge({
            ...challenge,
            title: editTitle,
            description: editDescription,
            refreshTime: editRefreshTime,
            history: [newHistory, ...(challenge.history || [])]
        });
        setIsEditing(false);
    }

    /* 
       HELPER: Get Grid Box Visuals 
       Determines the color/style of a day cell in the Progress Map 
       based on its completion status.
    */
    const getProgressStyle = (day: number) => {
        if (!challenge) return '';
        const isStrict = challenge.dailyRoutine.length > 0;

        // Fallback for non-strict challenges (deprecated path really, but safe to keep)
        if (!isStrict) {
            const isCompleted = challenge.completedDays.includes(day);
            return isCompleted
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-800 dark:text-cyan-200/80 shadow-[0_0_15px_-4px_rgba(34,211,238,0.3)]'
                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-400';
        }

        // Calculate % complete for the day
        const progress = challenge.dailyProgress[day] || [];
        const completedCount = progress.filter(Boolean).length;
        const totalCount = challenge.dailyRoutine.length;

        if (totalCount === 0) return 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-400';

        const percentage = (completedCount / totalCount) * 100;

        // 0% - Not started
        if (percentage === 0) return 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-400';

        // 100% - Perfect Day (Cyan Glow)
        if (percentage === 100) return 'bg-cyan-500/40 border-cyan-600 dark:border-cyan-400 text-cyan-900 dark:text-cyan-100 shadow-[0_0_15px_-4px_rgba(34,211,238,0.5)]';

        // Partial Progress Gradients
        // < 30% : Redish (Just started)
        if (percentage < 30) return 'bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-200/60';
        // < 70% : Orange (Making progress)
        if (percentage < 70) return 'bg-orange-500/10 border-orange-500/20 text-orange-900 dark:text-orange-200/60';
        // > 70% : Blue (Almost there)
        return 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200/60';
    };

    const getStats = () => {
        if (!challenge) return { completed: 0, consistency: 0, daysLeft: 0 };

        // Use elapsed days (based on time) rather than active progress
        // Ensure we don't divide by zero or exceed total duration
        const daysElapsed = Math.max(1, Math.min(challenge.days, todayIndex));

        const consistency = Math.round((challenge.completedDays.length / daysElapsed) * 100);

        // Days Remaining is purely time-based now
        // If todayIndex is 1 (Day 1), and Total is 75. Remaining is 75 (Today + 74 future).
        // If todayIndex is 76. Remaining is 0.
        const daysRemaining = Math.max(0, challenge.days - todayIndex + 1);

        return {
            completed: challenge.completedDays.length,
            consistency: isNaN(consistency) ? 0 : consistency,
            daysLeft: daysRemaining
        }
    };


    if (!challenge && !isCreating) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center px-4">
                <div className="relative group cursor-default">
                    <div className="absolute inset-0 bg-cyan-500/30 dark:bg-cyan-500/30 blur-[60px] rounded-full group-hover:bg-cyan-500/40 transition-all duration-700" />
                    <div className="w-24 h-24 bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center mb-8 relative shadow-2xl ring-1 ring-slate-100 dark:ring-white/5 group-hover:scale-105 transition-transform duration-500">
                        <Target size={48} className="text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    </div>
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">Forging Discipline</h2>
                <p className="text-slate-400 mb-10 text-lg max-w-md leading-relaxed">
                    "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                </p>
                <button
                    onClick={() => setIsCreating(true)}
                    className="group relative px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.4)]"
                >
                    <span className="relative z-10">Initiate Protocol</span>
                    <div className="absolute inset-0 rounded-xl bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        );
    }

    // Colors for the chart
    const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444'];

    // ANALYTICS: Logic for the Donut Chart
    // Calculates how often each specific task (e.g., "Read") has been done across ALL days.
    const getTaskStats = () => {
        if (!challenge || challenge.dailyRoutine.length === 0) return [];

        // Initialize counts
        const counts = new Array(challenge.dailyRoutine.length).fill(0);
        let totalCompletions = 0;

        // Iterate through history
        Object.values(challenge.dailyProgress).forEach(dayTasks => {
            dayTasks.forEach((isDone, idx) => {
                if (isDone) { counts[idx]++; totalCompletions++; }
            });
        });

        // Format for Chart
        return challenge.dailyRoutine.map((task, idx) => ({
            name: task.text,
            count: counts[idx],
            percentage: totalCompletions > 0 ? (counts[idx] / totalCompletions) * 100 : 0,
            color: CHART_COLORS[idx % CHART_COLORS.length]
        })).sort((a, b) => b.count - a.count); // Sort by most frequent
    };

    const taskStats = getTaskStats();

    const stats = getStats();
    // Determine if selected day is editable (must be today)
    const isEditable = selectedDay === todayIndex;

    return (
        <div className="animate-fade-in max-w-full space-y-8 relative pb-20">
            {isCreating ? (
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm max-w-2xl mx-auto shadow-2xl dark:shadow-none">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                        <Target className="text-cyan-600 dark:text-cyan-400" />
                        Create Your Challenge
                    </h3>
                    <form onSubmit={handleCreateChallenge} className="space-y-6">
                        {/* ... Existing definition fields ... */}
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Challenge Name</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., 30 Days of Coding, No Sugar, Workout..."
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Briefly describe your goal..."
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all min-h-[80px] resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Daily Routine Tasks</label>
                            <div className="flex gap-2 mb-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        placeholder="Task (e.g., Read 10 pages)"
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addRoutineTask();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="w-28 relative">
                                    <input
                                        type="time"
                                        value={newTaskTime}
                                        onChange={(e) => setNewTaskTime(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 dark:scheme-dark"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addRoutineTask}
                                    className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-xl transition-colors font-bold border border-slate-200 dark:border-white/10"
                                >
                                    Add
                                </button>
                            </div>
                            {dailyRoutine.length > 0 && (
                                <ul className="space-y-2 bg-black/5 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                    {dailyRoutine.map((task, index) => (
                                        <li key={task.id} className="flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-700 dark:text-slate-300">• {task.text}</span>
                                                {task.time && <span className="text-[10px] text-slate-500 ml-3">{format(new Date(`2000-01-01T${task.time}`), 'h:mm a')}</span>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeRoutineTask(index)}
                                                className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Duration (Days)</label>
                                <input
                                    type="number"
                                    value={daysInput}
                                    onChange={(e) => setDaysInput(e.target.value)}
                                    min="1"
                                    max="365"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Daily Refresh Time</label>
                                <input
                                    type="time"
                                    value={refreshTime}
                                    onChange={(e) => setRefreshTime(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium dark:scheme-dark"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(8,145,178,0.4)] transition-all hover:scale-[1.02]"
                            >
                                Launch Challenge
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                challenge && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        {/* 
                           SECTION 1: HERO HEADER 
                           Displays Title, Date, and main Challenge Controls (Reset, Settings)
                        */}
                        <div className="md:col-span-12 space-y-6">
                            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/10 p-8 shadow-xl dark:shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{challenge.title}</h2>
                                            {challenge.description && (
                                                <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg leading-relaxed">{challenge.description}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
                                                <Calendar size={14} className="text-cyan-600 dark:text-cyan-400" />
                                                <span>Started {format(new Date(challenge.startDate), 'MMM do')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
                                                <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                                                <span>Refreshes {challenge.refreshTime}</span>
                                            </div>
                                            {onNavigateToPomodoro && (
                                                <button
                                                    onClick={onNavigateToPomodoro}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-full border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
                                                >
                                                    <Target size={14} />
                                                    <span>Start Focus</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={startEditing}
                                            className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none cursor-pointer"
                                            title="Settings"
                                        >
                                            <Settings size={20} />
                                        </button>
                                        <button
                                            onClick={resetChallenge}
                                            className="p-2.5 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-xl text-red-500/60 dark:text-red-400/60 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-red-200 dark:border-red-500/5 shadow-sm dark:shadow-none cursor-pointer"
                                            title="Reset Progress"
                                        >
                                            <Zap size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 
                               SECTION 2: STATS DASHBOARD
                               Three cards showing high-level progress metrics.
                            */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm dark:shadow-none">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                        <Trophy className="text-cyan-600 dark:text-cyan-400" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Completed</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed} <span className="text-sm font-normal text-slate-500">Days</span></p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm dark:shadow-none">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                        <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Consistency</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.consistency}% <span className="text-sm font-normal text-slate-500">Success</span></p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm dark:shadow-none">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Left to Win</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.daysLeft} <span className="text-sm font-normal text-slate-500">Days</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Edit Mode Panel */}
                        {isEditing && (
                            <div className="md:col-span-12 mb-2 p-8 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 rounded-3xl animate-fade-in shadow-2xl z-20 backdrop-blur-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Challenge Name</label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Enter challenge name..."
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 text-lg font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Daily Refresh Time</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={editRefreshTime}
                                                onChange={(e) => setEditRefreshTime(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 text-lg dark:scheme-dark"
                                            />
                                            <Clock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Description</label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="What is the purpose of this challenge?"
                                            rows={2}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 md:flex-none px-6 py-3 text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveSettings}
                                        className="flex-1 md:flex-none px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* 
                           SECTION 3: DAILY PROTOCOL (Left Column)
                           The checklist for the selected day. 
                           Includes logic to Lock future days or Archive past days.
                        */}
                        <div className="md:col-span-5 flex flex-col gap-6">
                            {/* Selected Day Card */}
                            {selectedDay && (
                                <div className={`bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-none h-full flex flex-col relative overflow-hidden group transition-all duration-300 ${!isEditable ? 'opacity-90 grayscale-[0.3]' : ''}`}>
                                    {/* Background decorative glow */}
                                    <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />

                                    <div className="relative z-10 flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
                                                {isEditable ? 'Active Protocol' : selectedDay < todayIndex ? 'Past Protocol' : 'Future Protocol'}
                                            </h4>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                Day {selectedDay}
                                                {challenge.completedDays.includes(selectedDay) && (
                                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20 font-medium">Completed</span>
                                                )}
                                                {!isEditable && (
                                                    <span className="bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600/30 font-medium flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {selectedDay < todayIndex ? 'Archived' : 'Locked'}
                                                    </span>
                                                )}
                                            </h3>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {challenge.dailyProgress[selectedDay]?.filter(Boolean).length || 0}
                                                <span className="text-lg text-slate-400 dark:text-slate-500 font-medium">/{challenge.dailyRoutine.length}</span>
                                            </div>
                                            {onNavigateToPlanner && (
                                                <button
                                                    onClick={() => onNavigateToPlanner('disciplined', 'day')}
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400/70 hover:text-cyan-700 dark:hover:text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 dark:border-cyan-400/20 px-2 py-1 rounded-lg transition-all cursor-pointer"
                                                >
                                                    <Calendar size={12} />
                                                    View in Planner
                                                </button>
                                            )}

                                        </div>
                                    </div>

                                    {challenge.dailyRoutine.length > 0 ? (
                                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                            {challenge.dailyRoutine.map((task, idx) => {
                                                const isDone = challenge.dailyProgress[selectedDay]?.[idx] || false;
                                                return (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => isEditable && toggleRoutineTask(selectedDay, idx)}
                                                        className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 group/item ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                                                            } ${isDone
                                                                ? 'bg-cyan-500/10 border-cyan-500/30 dark:shadow-[0_4px_20px_-10px_rgba(34,211,238,0.4)] shadow-sm'
                                                                : 'bg-white dark:bg-white/2 border-slate-100 dark:border-transparent ' + (isEditable ? 'hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md' : '')
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 border-2 ${isDone ? 'bg-cyan-500 border-cyan-500 scale-110' : 'bg-transparent border-slate-300 dark:border-slate-600 ' + (isEditable ? 'group-hover/item:border-slate-400' : '')
                                                            }`}>
                                                            {isDone && <CheckCircle2 size={12} className="text-white dark:text-black stroke-[3px]" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className={`text-sm font-bold transition-colors block ${isDone ? 'text-slate-900 dark:text-white line-through decoration-cyan-500/50 decoration-2' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                {task.text}
                                                            </span>
                                                            {task.time && (
                                                                <span className="text-[10px] text-slate-500 font-mono">
                                                                    {format(new Date(`2000-01-01T${task.time}`), 'h:mm a')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic pb-4">
                                            <p>No routine tasks defined.</p>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-xs text-center text-slate-500">
                                            {isEditable
                                                ? "Complete all tasks to mark this day as victorious."
                                                : "This day's protocol is sealed. Focus on today."
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 
                           SECTION 4: ANALYTICS & GRID (Right Column)
                           Contains the Habit Distribution chart and the main Progress Map.
                        */}
                        <div className="md:col-span-7 flex flex-col gap-6">

                            {/* SECTION 4a: ADVANCED ANALYTICS DASHBOARD */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* 1. Full Challenge Progress (Circle) */}
                                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg dark:shadow-none backdrop-blur-md min-h-[220px]">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Challenge Progress</h4>
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="8" />
                                            <circle
                                                cx="50" cy="50" r="40"
                                                fill="transparent"
                                                stroke="url(#gradient-cyan)"
                                                strokeWidth="8"
                                                strokeDasharray={2 * Math.PI * 40}
                                                strokeDashoffset={2 * Math.PI * 40 * (1 - (challenge.dailyRoutine.length > 0 ? challenge.completedDays.length / challenge.days : 0))}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                            <defs>
                                                <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#06b6d4" />
                                                    <stop offset="100%" stopColor="#22d3ee" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round((challenge.dailyRoutine.length > 0 ? challenge.completedDays.length / challenge.days : 0) * 100)}%</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Success</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">{challenge.completedDays.length} of {challenge.days} Days Victorious</p>
                                </div>

                                {/* 2. Daily Protocol Progress (Circle) */}
                                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg dark:shadow-none backdrop-blur-md min-h-[220px]">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Day {selectedDay} Protocol</h4>
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        {(() => {
                                            const done = challenge.dailyProgress[selectedDay || 0]?.filter(Boolean).length || 0;
                                            const total = challenge.dailyRoutine.length;
                                            const percent = total > 0 ? done / total : 0;
                                            return (
                                                <>
                                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="8" />
                                                        <circle
                                                            cx="50" cy="50" r="40"
                                                            fill="transparent"
                                                            stroke="url(#gradient-green)"
                                                            strokeWidth="8"
                                                            strokeDasharray={2 * Math.PI * 40}
                                                            strokeDashoffset={2 * Math.PI * 40 * (1 - percent)}
                                                            strokeLinecap="round"
                                                            className="transition-all duration-1000 ease-out"
                                                        />
                                                        <defs>
                                                            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" stopColor="#10b981" />
                                                                <stop offset="100%" stopColor="#34d399" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(percent * 100)}%</span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Tasks</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {challenge.dailyProgress[selectedDay || 0]?.filter(Boolean).length || 0} / {challenge.dailyRoutine.length} Completed
                                    </p>
                                </div>

                                {/* 3. Habit Leaderboard (Data representation) */}
                                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col shadow-lg dark:shadow-none backdrop-blur-md min-h-[220px]">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                        <span>Habit Leaderboard</span>
                                        <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-500" />
                                    </h4>
                                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                                        {taskStats.length > 0 ? (
                                            taskStats.slice(0, 4).map((stat, i) => (
                                                <div key={i} className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center text-[11px]">
                                                        <span className="text-slate-900 dark:text-slate-200 font-bold truncate max-w-[120px]">{stat.name}</span>
                                                        <span className="text-slate-500 font-mono">{stat.count} Wins</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{
                                                                width: `${(stat.count / Math.max(...taskStats.map(s => s.count), 1)) * 100}%`,
                                                                backgroundColor: stat.color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-xs">
                                                No data yet
                                            </div>
                                        )}
                                    </div>
                                    {taskStats.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Top: <span className="text-slate-900 dark:text-white font-bold">{taskStats[0].name}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4b. Progress Map (Grid) */}
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl dark:shadow-none backdrop-blur-sm flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Calendar size={20} className="text-slate-400 dark:text-slate-500" />
                                        Progress Map
                                    </h4>
                                    <div className="text-xs font-mono bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg text-slate-500 dark:text-slate-400">
                                        {Math.round((challenge.completedDays.length / challenge.days) * 100)}% Complete
                                    </div>
                                </div>



                                <div className="grid grid-cols-8 sm:grid-cols-12 gap-3">
                                    {Array.from({ length: challenge.days }, (_, i) => i + 1).map((day) => {
                                        const styleClass = getProgressStyle(day);
                                        const isSelected = selectedDay === day;
                                        const isCurrent = day === todayIndex;
                                        return (
                                            <div
                                                key={day}
                                                onClick={() => setSelectedDay(day)}
                                                className={`
                                                group relative aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300  h-11
                                                ${styleClass}
                                                ${isSelected ? 'ring-2 ring-cyan-500 dark:ring-cyan-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-100 z-10 shadow-lg dark:shadow-cyan-500/20 shadow-cyan-500/10' : 'opacity-80 hover:opacity-100 hover:scale-105 active:scale-95'}
                                                ${isCurrent && !isSelected ? 'ring-1 ring-cyan-600 dark:ring-cyan-500/50' : ''}
                                            `}
                                            >
                                                <span className={`text-xs font-bold ${challenge.completedDays.includes(day) || (challenge.dailyProgress[day] && challenge.dailyProgress[day].filter(Boolean).length > 0) ? 'opacity-100' : 'opacity-40'}`}>
                                                    {day}
                                                </span>
                                                {isCurrent && (
                                                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {challenge.completedDays.length === challenge.days && (
                                    <div className="mt-8 p-6 bg-linear-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl flex items-center gap-6 animate-fade-in shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]">
                                        <div className="p-4 bg-yellow-500 rounded-full text-black shadow-lg shadow-yellow-500/40">
                                            <Trophy size={32} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Legendary Status Achieved!</h3>
                                            <p className="text-yellow-700 dark:text-yellow-200/80 font-medium">You have mastered this challenge. Time for the next level?</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 4c. Recent Activity (History) */}
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl dark:shadow-none backdrop-blur-sm flex flex-col min-h-[300px]">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <TrendingUp size={20} className="text-slate-400 dark:text-slate-500" />
                                        Recent Activity
                                    </h4>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {challenge.history?.length || 0} Events
                                    </div>
                                </div>

                                <div className="space-y-4 overflow-y-scroll max-h-[400px] pr-2 custom-scrollbar">
                                    {challenge.history && challenge.history.length > 0 ? (
                                        challenge.history.slice(0, 20).map((record) => (
                                            <div key={record.id} className="flex gap-4 group/h">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${record.type === 'add' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        record.type === 'edit' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                                                            record.type === 'delete' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                                'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                                        }`}>
                                                        {record.type === 'add' && <Plus size={14} />}
                                                        {record.type === 'edit' && <Edit2 size={14} />}
                                                        {record.type === 'delete' && <Trash2 size={14} />}
                                                        {record.type === 'toggle' && <CheckCircle2 size={14} />}
                                                    </div>
                                                    <div className="w-px flex-1 bg-slate-100 dark:bg-white/5 group-last/h:hidden" />
                                                </div>
                                                <div className="pb-6">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            {format(record.timestamp, 'MMM d, h:mm a')}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${record.type === 'add' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/70' :
                                                            record.type === 'edit' ? 'bg-cyan-500/5 border-cyan-500/10 text-cyan-500/70' :
                                                                record.type === 'delete' ? 'bg-red-500/5 border-red-500/10 text-red-500/70' :
                                                                    'bg-purple-500/5 border-purple-500/10 text-purple-500/70'
                                                            }`}>
                                                            {record.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {record.details || record.taskText}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                            <TrendingUp size={32} className="text-slate-500 mb-2" />
                                            <p className="text-xs text-slate-500 font-medium italic">No activity logs recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )
            )}
        </div>
    );
};
