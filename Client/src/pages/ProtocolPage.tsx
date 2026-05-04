import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Clock, Save, TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Challenge } from '../types/index';
import { generateId } from '../utils/id';
import { ChallengeHeader } from '../features/challenges/components/ChallengeHeader';
import { StatsDashboard } from '../features/analytics/components/StatsDashboard';
import { DailyTasks } from '../features/tasks/components/DailyTasks';
import { ProgressMap } from '../features/challenges/components/ProgressMap';
import { AnalyticsPanel } from '../features/analytics/components/AnalyticsPanel';
import * as challengeService from '../services/challengeService';
import { useChallengeStore } from '../store/useChallengeStore';
import { useViewStore } from '../store/useViewStore';
export interface DisciplinedViewProps {
    challenge: Challenge | null;
    onUpdateChallenge: (challenge: Challenge | null, idToDelete?: string) => void;
}

export const ProtocolPage: React.FC<DisciplinedViewProps> = ({ challenge, onUpdateChallenge }) => {
    const { setPlannedFilter, setPlannedViewMode } = useChallengeStore();
    const { setCurrentView, setPomodoroImport } = useViewStore();

    const onNavigateToPlanner = (filter: 'normal' | 'disciplined', view: 'week' | 'day') => {
        if (filter) setPlannedFilter(filter);
        if (view) setPlannedViewMode(view);
        setCurrentView('planned');
    };

    const onNavigateToPomodoro = () => {
        setPomodoroImport('protocol');
        setCurrentView('pomodoro');
    };
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
    const [editNewTask, setEditNewTask] = useState('');
    const [editNewTaskTime, setEditNewTaskTime] = useState('');

    // Derived State for Current Day
    // Derived State for Current Day (Respecting Refresh Time)
    const todayIndex = challengeService.calculateTodayIndex(challenge);

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
            id: generateId(),
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
            id: generateId(),
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
        const updates = challengeService.toggleRoutineTaskLogic(challenge, day, taskIndex, todayIndex);
        if (updates) {
            updateChallengeState(updates);
        }
    };

    const updateChallengeState = (updates: Partial<Challenge>) => {
        if (!challenge) return;
        const updatedChallenge = { ...challenge, ...updates };
        onUpdateChallenge(updatedChallenge);
    };

    const resetChallenge = () => {
        if (challenge && confirm('Are you sure you want to start over?')) {
            const updates = challengeService.resetChallengeLogic(challenge, todayIndex);
            onUpdateChallenge({ ...challenge, ...updates });
            setSelectedDay(1);
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
        const updates = challengeService.getSettingsUpdate(challenge, editTitle, editDescription, editRefreshTime);
        if (updates) {
            onUpdateChallenge({ ...challenge, ...updates });
        }
        setIsEditing(false);
    }

    /* 
       HELPER: Get Grid Box Visuals 
       Determines the color/style of a day cell in the Progress Map 
       based on its completion status.
    */
    const getProgressStyle = (day: number) => challengeService.getProgressStyleLogic(challenge, day);

    const stats = challengeService.calculateStats(challenge, todayIndex);


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

    const taskStats = challengeService.calculateTaskStats(challenge);
    // Determine if selected day is editable (must be today)
    const isEditable = selectedDay === todayIndex;

    const { total: selectedDayTotalTasks, completed: selectedDayCompletedTasks } = challengeService.calculateDayStats(challenge, selectedDay);
    const overallProgressPercent = challenge && challenge.days > 0 ? (challenge.completedDays.length / challenge.days) * 100 : 0;

    return (
        <div className="animate-fade-in max-w-full space-y-4 md:space-y-8 relative pb-4 md:pb-20">
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
                            <ChallengeHeader 
                                challenge={challenge}
                                onStartEditing={startEditing}
                                onResetChallenge={resetChallenge}
                                onNavigateToPomodoro={onNavigateToPomodoro}
                            />

                            {/* 
                               SECTION 2: STATS DASHBOARD
                               Three cards showing high-level progress metrics.
                            */}
                            <StatsDashboard stats={stats} />
                        </div>







                        {/* Edit Mode Panel */}
                        {isEditing && (
                            <div className="md:col-span-12 mb-2 p-4 md:p-8 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/20 rounded-3xl animate-fade-in shadow-2xl z-20 backdrop-blur-xl">
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

                                    {/* Add New Task Section */}
                                    <div className="md:col-span-2 border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                                        <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-3">Add New Routine Task (Effective from Today)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editNewTask}
                                                onChange={(e) => setEditNewTask(e.target.value)}
                                                placeholder="New task..."
                                                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        // Helper to add task immediately to state (queued for save)
                                                        // But saveSettings handles saving.
                                                        // We actually need to update the challenge state directly or via the save function?
                                                        // SaveSettings builds a history. We should probably add the task to the queue there or modify onUpdateChallenge.
                                                        // Actually, let's just make a specific "Add Task" button that commits immediately or adds to the `challenge` object in memory.
                                                        // But `challenge` prop is immutable from here.

                                                        // Wait, `saveSettings` uses `editTitle` etc.
                                                        // Adding a task is a structural change.
                                                        // Let's Handle it separately or include it in `saveSettings`.
                                                        // Re-implementing logic inline here for simplicity given the constraints:
                                                    }
                                                }}
                                            />
                                            <input
                                                type="time"
                                                value={editNewTaskTime}
                                                onChange={(e) => setEditNewTaskTime(e.target.value)}
                                                className="w-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 text-sm dark:scheme-dark"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!editNewTask.trim()) return;
                                                    const newTaskObj = {
                                                        id: generateId(),
                                                        text: editNewTask.trim(),
                                                        time: editNewTaskTime || undefined,
                                                        addedOnDay: todayIndex // Effective from today!
                                                    };

                                                    // Immediately update the challenge with the new task
                                                    onUpdateChallenge({
                                                        ...challenge,
                                                        dailyRoutine: [...challenge.dailyRoutine, newTaskObj],
                                                        history: [{
                                                            id: generateId(),
                                                            type: 'add',
                                                            taskId: newTaskObj.id,
                                                            taskText: newTaskObj.text,
                                                            timestamp: Date.now(),
                                                            details: `Added new task from Day ${todayIndex}`
                                                        }, ...(challenge.history || [])]
                                                    });
                                                    setEditNewTask('');
                                                    setEditNewTaskTime('');
                                                }}
                                                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm transition-colors border border-emerald-500/20"
                                            >
                                                Add Task
                                            </button>
                                        </div>
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
                                <DailyTasks
                                    challenge={challenge}
                                    selectedDay={selectedDay}
                                    todayIndex={todayIndex}
                                    isEditable={isEditable}
                                    completedCount={selectedDayCompletedTasks}
                                    totalCount={selectedDayTotalTasks}
                                    onToggleTask={toggleRoutineTask}
                                    onNavigateToPlanner={onNavigateToPlanner}
                                />
                            )}
                        </div>

                        {/* 
                           SECTION 4: ANALYTICS & GRID (Right Column)
                           Contains the Habit Distribution chart and the main Progress Map.
                        */}
                        <div className="md:col-span-7 flex flex-col gap-6">

                            {/* SECTION 4a: ADVANCED ANALYTICS DASHBOARD */}
                            <AnalyticsPanel
                                overallProgressPercent={overallProgressPercent}
                                completedDaysCount={challenge.completedDays.length}
                                totalChallengeDays={challenge.days}
                                selectedDay={selectedDay}
                                selectedDayCompletedTasks={selectedDayCompletedTasks}
                                selectedDayTotalTasks={selectedDayTotalTasks}
                                taskStats={taskStats}
                            />

                            {/* 4b. Progress Map (Grid) */}
                            <ProgressMap
                                challenge={challenge}
                                selectedDay={selectedDay}
                                todayIndex={todayIndex}
                                overallProgressPercent={overallProgressPercent}
                                getProgressStyle={getProgressStyle}
                                onSelectDay={setSelectedDay}
                            />

                            {/* 4c. Recent Activity (History) */}
                            <div className="order-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-4 md:p-6 shadow-xl dark:shadow-none backdrop-blur-sm flex flex-col min-h-[300px]">
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
