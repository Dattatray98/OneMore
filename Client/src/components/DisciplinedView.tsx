import React, { useState, useEffect } from 'react';
import { Target, Trophy, CheckCircle2, Clock, Settings, Save, Zap, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { format, differenceInDays, startOfToday, isSameDay, parseISO } from 'date-fns';

// TYPES & INTERFACES
// =================
// Defines the structure of our Challenge object.
// We persist this entire object to localStorage.
interface Challenge {
    id: string;
    title: string;
    description?: string;
    dailyRoutine: string[]; // List of task names (e.g., ["Read", "Workout"])
    days: number;           // Total duration (e.g., 30 days)
    startDate: string;      // ISO Date string
    completedDays: number[]; // Array of day numbers (1-based) that are fully complete
    dailyProgress: Record<number, boolean[]>; // Maps day number (1) to array of completion status ([true, false, ...])
    refreshTime: string; // "HH:mm" format - when the "new day" logic might arguably kick in (mainly visual for now)
}

export const DisciplinedView: React.FC = () => {
    // Challenge State
    // STATE MANAGEMENT
    // ================

    // 1. Challenge Data: Loaded from localStorage on mount.
    // If null, we show the "Create Challenge" empty state.
    const [challenge, setChallenge] = useState<Challenge | null>(() => {
        const saved = localStorage.getItem('disciplined_challenge');
        if (!saved) return null;
        const parsed = JSON.parse(saved);
        // Ensure legacy data is compatible by providing defaults
        return {
            ...parsed,
            dailyRoutine: parsed.dailyRoutine || [],
            dailyProgress: parsed.dailyProgress || {},
            refreshTime: parsed.refreshTime || '00:00',
        };
    });

    // 2. Creation Form State: Temporary state while user is building a new challenge.
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dailyRoutine, setDailyRoutine] = useState<string[]>([]);
    const [newTask, setNewTask] = useState('');
    const [daysInput, setDaysInput] = useState('30');
    const [refreshTime, setRefreshTime] = useState('00:00');
    const [isCreating, setIsCreating] = useState(false);

    // 3. UI Interaction State
    const [selectedDay, setSelectedDay] = useState<number | null>(null); // Currently viewed day in the dashboard
    const [isEditing, setIsEditing] = useState(false); // Toggle for settings mode
    const [editRefreshTime, setEditRefreshTime] = useState('');

    // Derived State for Current Day
    const todayIndex = challenge ? differenceInDays(startOfToday(), parseISO(challenge.startDate)) + 1 : 0;

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
            refreshTime
        };

        setChallenge(newChallenge);
        localStorage.setItem('disciplined_challenge', JSON.stringify(newChallenge));
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
        setDailyRoutine([...dailyRoutine, newTask.trim()]);
        setNewTask('');
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
        setChallenge(updatedChallenge);
        localStorage.setItem('disciplined_challenge', JSON.stringify(updatedChallenge));
    };

    const resetChallenge = () => {
        if (confirm('Are you sure you want to start over?')) {
            setChallenge(null);
            localStorage.removeItem('disciplined_challenge');
            setSelectedDay(null);
        }
    }

    const startEditing = () => {
        if (!challenge) return;
        setEditRefreshTime(challenge.refreshTime);
        setIsEditing(true);
    }

    const saveSettings = () => {
        updateChallengeState({ refreshTime: editRefreshTime });
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
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-200/80 shadow-[0_0_15px_-4px_rgba(34,211,238,0.3)]'
                : 'bg-white/5 border-white/5 hover:border-white/20 text-slate-700';
        }

        // Calculate % complete for the day
        const progress = challenge.dailyProgress[day] || [];
        const completedCount = progress.filter(Boolean).length;
        const totalCount = challenge.dailyRoutine.length;

        if (totalCount === 0) return 'bg-white/5 border-white/5 text-slate-700';

        const percentage = (completedCount / totalCount) * 100;

        // 0% - Not started
        if (percentage === 0) return 'bg-white/5 border-white/5 hover:border-white/20 text-slate-700';

        // 100% - Perfect Day (Cyan Glow)
        if (percentage === 100) return 'bg-cyan-500/40 border-cyan-400 text-cyan-100 shadow-[0_0_15px_-4px_rgba(34,211,238,0.5)]';

        // Partial Progress Gradients
        // < 30% : Redish (Just started)
        if (percentage < 30) return 'bg-red-500/10 border-red-500/20 text-red-200/60';
        // < 70% : Orange (Making progress)
        if (percentage < 70) return 'bg-orange-500/10 border-orange-500/20 text-orange-200/60';
        // > 70% : Blue (Almost there)
        return 'bg-blue-500/10 border-blue-500/20 text-blue-200/60';
    };

    const getStats = () => {
        if (!challenge) return { completed: 0, consistency: 0, daysLeft: 0 };
        // Simple streak: consecutive days from end backwards (not perfect but OK for visual)
        // Or just current active streak ending Today.

        const consistency = Math.round((challenge.completedDays.length / challenge.days) * 100);
        const daysLeft = challenge.days - challenge.completedDays.length; // Actually days - currentDay index might be better, but this is "Remaining Wins needed"

        return {
            completed: challenge.completedDays.length,
            consistency,
            daysLeft
        }
    };


    if (!challenge && !isCreating) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center px-4">
                <div className="relative group cursor-default">
                    <div className="absolute inset-0 bg-cyan-500/30 blur-[60px] rounded-full group-hover:bg-cyan-500/40 transition-all duration-700" />
                    <div className="w-24 h-24 bg-linear-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl flex items-center justify-center mb-8 relative shadow-2xl ring-1 ring-white/5 group-hover:scale-105 transition-transform duration-500">
                        <Target size={48} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    </div>
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-b from-white to-slate-500">Forging Discipline</h2>
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
            name: task,
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
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm max-w-2xl mx-auto shadow-2xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Target className="text-cyan-400" />
                        Create Your Challenge
                    </h3>
                    <form onSubmit={handleCreateChallenge} className="space-y-6">
                        {/* ... Existing definition fields ... */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Challenge Name</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., 30 Days of Coding, No Sugar, Workout..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Briefly describe your goal..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all min-h-[80px] resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Daily Routine Tasks</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Add a task (e.g., Read 10 pages)"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addRoutineTask();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addRoutineTask}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium border border-white/10"
                                >
                                    Add
                                </button>
                            </div>
                            {dailyRoutine.length > 0 && (
                                <ul className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                                    {dailyRoutine.map((task, index) => (
                                        <li key={index} className="flex items-center justify-between group">
                                            <span className="text-sm text-slate-300">• {task}</span>
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
                                <label className="block text-sm font-medium text-slate-400 mb-2">Duration (Days)</label>
                                <input
                                    type="number"
                                    value={daysInput}
                                    onChange={(e) => setDaysInput(e.target.value)}
                                    min="1"
                                    max="365"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Daily Refresh Time</label>
                                <input
                                    type="time"
                                    value={refreshTime}
                                    onChange={(e) => setRefreshTime(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
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
                            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 p-8 shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{challenge.title}</h2>
                                            {challenge.description && (
                                                <p className="text-slate-400 max-w-xl text-lg leading-relaxed">{challenge.description}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-slate-300">
                                                <Calendar size={14} className="text-cyan-400" />
                                                <span>Started {format(new Date(challenge.startDate), 'MMM do')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-slate-300">
                                                <Clock size={14} className="text-purple-400" />
                                                <span>Refreshes {challenge.refreshTime}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={startEditing}
                                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-white/5"
                                            title="Settings"
                                        >
                                            <Settings size={20} />
                                        </button>
                                        <button
                                            onClick={resetChallenge}
                                            className="p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-red-400/60 hover:text-red-400 transition-colors border border-red-500/5"
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
                                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                        <Trophy className="text-cyan-400" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Completed</p>
                                        <p className="text-2xl font-bold text-white">{stats.completed} <span className="text-sm font-normal text-slate-500">Days</span></p>
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                        <BarChart3 className="text-purple-400" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Consistency</p>
                                        <p className="text-2xl font-bold text-white">{stats.consistency}% <span className="text-sm font-normal text-slate-500">Success</span></p>
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <TrendingUp className="text-emerald-400" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Left to Win</p>
                                        <p className="text-2xl font-bold text-white">{stats.daysLeft} <span className="text-sm font-normal text-slate-500">Days</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Edit Mode Panel */}
                        {isEditing && (
                            <div className="md:col-span-12 mb-2 p-6 bg-slate-800/80 border border-white/10 rounded-2xl animate-fade-in flex flex-col md:flex-row items-end gap-6 shadow-xl z-20">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Update Daily Refresh Time</label>
                                    <input
                                        type="time"
                                        value={editRefreshTime}
                                        onChange={(e) => setEditRefreshTime(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 text-lg"
                                    />
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 md:flex-none px-6 py-3 text-slate-400 hover:text-white font-medium hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveSettings}
                                        className="flex-1 md:flex-none px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
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
                                <div className={`bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-xl h-full flex flex-col relative overflow-hidden group transition-all duration-300 ${!isEditable ? 'opacity-90 grayscale-[0.3]' : ''}`}>
                                    {/* Background decorative glow */}
                                    <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />

                                    <div className="relative z-10 flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                                                {isEditable ? 'Active Protocol' : selectedDay < todayIndex ? 'Past Protocol' : 'Future Protocol'}
                                            </h4>
                                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                                Day {selectedDay}
                                                {challenge.completedDays.includes(selectedDay) && (
                                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20 font-medium">Completed</span>
                                                )}
                                                {!isEditable && (
                                                    <span className="bg-slate-700/50 text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-600/30 font-medium flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {selectedDay < todayIndex ? 'Archived' : 'Locked'}
                                                    </span>
                                                )}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-white">
                                                {challenge.dailyProgress[selectedDay]?.filter(Boolean).length || 0}
                                                <span className="text-lg text-slate-500 font-medium">/{challenge.dailyRoutine.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {challenge.dailyRoutine.length > 0 ? (
                                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                            {challenge.dailyRoutine.map((task, idx) => {
                                                const isDone = challenge.dailyProgress[selectedDay]?.[idx] || false;
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => isEditable && toggleRoutineTask(selectedDay, idx)}
                                                        className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 group/item ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                                                            } ${isDone
                                                                ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_4px_20px_-10px_rgba(34,211,238,0.4)]'
                                                                : 'bg-white/[0.02] border-transparent ' + (isEditable ? 'hover:bg-white/5 hover:border-white/10' : '')
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 border-2 ${isDone ? 'bg-cyan-500 border-cyan-500 scale-110' : 'bg-transparent border-slate-600 ' + (isEditable ? 'group-hover/item:border-slate-400' : '')
                                                            }`}>
                                                            {isDone && <CheckCircle2 size={12} className="text-black stroke-[3px]" />}
                                                        </div>
                                                        <span className={`text-sm font-bold transition-colors ${isDone ? 'text-white line-through decoration-cyan-500/50 decoration-2' : 'text-slate-300'}`}>
                                                            {task}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic pb-4">
                                            <p>No routine tasks defined.</p>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-6 border-t border-white/5">
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

                            {/* 4a. Habit Analytics (Minimalist Layout) */}
                            {taskStats.length > 0 && (
                                <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 shadow-sm backdrop-blur-md flex flex-col md:flex-row items-center gap-10 relative overflow-hidden min-h-[220px]">
                                    <div className="flex-1 w-full space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Zap className="text-cyan-500" size={14} />
                                                Habit Distribution
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {taskStats.map((stat, index) => (
                                                <div key={index} className="flex flex-col gap-1.5 p-2 rounded-xl transition-all">
                                                    <div className="flex justify-between items-center text-[11px] font-medium">
                                                        <span className="text-slate-200 truncate pr-2">{stat.name}</span>
                                                        <span className="text-slate-500">{stat.percentage.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                                            style={{
                                                                width: `${stat.percentage}%`,
                                                                backgroundColor: stat.color,
                                                                boxShadow: `0 0 10px ${stat.color}40`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                                        <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                                            {taskStats.map((stat, i) => (
                                                <circle
                                                    key={i}
                                                    cx="0" cy="0" r="0.85"
                                                    fill="transparent"
                                                    stroke={stat.color}
                                                    strokeWidth="0.15"
                                                    strokeDasharray={`${(stat.percentage / 100) * (Math.PI * 1.7)} ${(Math.PI * 1.7)}`}
                                                    transform={`rotate(${taskStats.slice(0, i).reduce((sum, s) => sum + s.percentage, 0) * 3.6})`}
                                                    className="transition-all duration-700 opacity-80 hover:opacity-100"
                                                />
                                            ))}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Top Habit</span>
                                            <span className="text-xl font-black text-white">{taskStats[0]?.percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4b. Progress Map (Grid) */}
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xl font-bold flex items-center gap-2">
                                        <Calendar size={20} className="text-slate-400" />
                                        Progress Map
                                    </h4>
                                    <div className="text-xs font-mono bg-white/5 px-3 py-1 rounded-lg text-slate-400">
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
                                                ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-100 z-10 shadow-lg shadow-cyan-500/20' : 'opacity-80 hover:opacity-100 hover:scale-105 active:scale-95'}
                                                ${isCurrent && !isSelected ? 'ring-1 ring-cyan-500/50' : ''}
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
                                            <h3 className="text-2xl font-bold text-white mb-1">Legendary Status Achieved!</h3>
                                            <p className="text-yellow-200/80 font-medium">You have mastered this challenge. Time for the next level?</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )
            )}
        </div>
    );
};
