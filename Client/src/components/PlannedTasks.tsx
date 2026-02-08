import React, { useState } from 'react';
import type { Task, Challenge, HistoryRecord } from '../types';
import { Calendar as CalendarIcon, ChevronRight, Plus, Check, Target, Trash2, Edit2, TrendingUp, ArrowUpRight } from 'lucide-react';
import { format, isSameDay, differenceInDays, parseISO } from 'date-fns';
import { TaskModal } from './TaskModal';
import { ChallengeCreationModal } from './ChallengeCreationModal';

interface PlannedTasksProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onAdd: (taskOrText: string | Partial<Task>) => void;
    onDelete: (id: string) => void;
    challenges: Challenge[];
    activeChallenge: Challenge | null;
    onUpdateChallenge: (challenge: Challenge | null, idToDelete?: string) => void;
    onSelectChallenge: (id: string) => void;
    filter: 'normal' | 'disciplined';
    onFilterChange: (filter: 'normal' | 'disciplined') => void;
    viewMode: 'week' | 'day';
    onViewModeChange: (viewMode: 'week' | 'day') => void;
    onViewChange: (view: 'my-day' | 'important' | 'planned' | 'disciplined' | 'notes') => void;
    onNavigateToPomodoro?: (tasks: Task[]) => void;
}

export const PlannedTasks: React.FC<PlannedTasksProps> = ({
    tasks, onToggle, onUpdate, onAdd, onDelete, challenges, activeChallenge, onUpdateChallenge,
    onSelectChallenge, filter, onFilterChange, viewMode, onViewModeChange, onViewChange, onNavigateToPomodoro
}) => {
    // Calibrate "Today" based on Active Challenge Refresh Time
    const getEffectiveDate = (date: Date) => {
        if (!activeChallenge || !activeChallenge.refreshTime) return date;
        const [refHours, refMins] = activeChallenge.refreshTime.split(':').map(Number);
        const shifted = new Date(date.getTime());
        shifted.setHours(shifted.getHours() - refHours);
        shifted.setMinutes(shifted.getMinutes() - refMins);
        return shifted;
    };

    const effectiveToday = getEffectiveDate(new Date());
    effectiveToday.setHours(0, 0, 0, 0);

    const today_raw = effectiveToday;

    const [selectedDate, setSelectedDate] = useState(effectiveToday);
    const taskTypeFilter = filter;
    const setTaskTypeFilter = onFilterChange;
    const setViewMode = onViewModeChange;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
    const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
    const [modalDefaultTime, setModalDefaultTime] = useState<string | undefined>(undefined);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeChallenges = Array.isArray(challenges) ? challenges : [];

    // 1. Normal Task Dates
    const normalDates = Array.from(new Set(
        safeTasks
            .filter(t => t.scheduledDate && new Date(t.scheduledDate) >= today_raw)
            .map(t => t.scheduledDate!)
    )).map(dateStr => {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d;
    }).sort((a, b) => a.getTime() - b.getTime());

    // 2. Discipline Protocol Dates (Active Challenge active period)
    const disciplineDates: Date[] = [];
    if (activeChallenge && activeChallenge.startDate) {
        const start = parseISO(activeChallenge.startDate);
        for (let i = 0; i < activeChallenge.days; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);
            if (d >= today_raw) {
                disciplineDates.push(d);
            }
        }
    }

    // Determine which list to show in the "Upcoming Schedule" sidebar
    const dates = taskTypeFilter === 'normal'
        ? (normalDates.length > 0 ? normalDates : [today_raw])
        : (disciplineDates.length > 0 ? disciplineDates.slice(0, 5) : [today_raw]);

    const handleAddTask = (dateStr?: string, timeStr?: string) => {
        setEditingTask(undefined);
        setModalDefaultDate(dateStr || format(selectedDate, 'yyyy-MM-dd'));
        setModalDefaultTime(timeStr);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = (taskData: Partial<Task>) => {
        if (taskTypeFilter === 'disciplined' || (taskData.id && taskData.id.startsWith('protocol-'))) {
            if (!activeChallenge) return;

            if (taskData.id && taskData.id.startsWith('protocol-')) {
                const idx = parseInt(taskData.id.split('-')[1]);
                const diff = differenceInDays(selectedDate, parseISO(activeChallenge.startDate)) + 1;

                const original = activeChallenge.dailyRoutine[idx];
                const currentOverride = activeChallenge.dailyOverrides?.[diff]?.[idx];

                const currentText = currentOverride?.text || original.text;
                const currentTime = currentOverride?.time || original.time;

                const newText = taskData.text || currentText;
                const newTime = taskData.scheduledTime || currentTime;

                const changes: string[] = [];
                if (currentText !== newText) changes.push(`renamed "${currentText}" to "${newText}"`);
                if (currentTime !== newTime) changes.push(`changed time from ${currentTime || 'Anytime'} to ${newTime || 'Anytime'}`);

                const updatedOverrides = { ...(activeChallenge.dailyOverrides || {}) };
                if (!updatedOverrides[diff]) updatedOverrides[diff] = {};
                updatedOverrides[diff][idx] = {
                    text: newText,
                    time: newTime
                };

                const newHistory: HistoryRecord = {
                    id: crypto.randomUUID(),
                    type: 'edit',
                    taskId: taskData.id,
                    taskText: newText,
                    timestamp: Date.now(),
                    details: changes.length > 0
                        ? `Day ${diff} adjustment: ${changes.join(' and ')}`
                        : `Day ${diff} specific: No visible changes recorded`
                };

                onUpdateChallenge({
                    ...activeChallenge,
                    dailyOverrides: updatedOverrides,
                    history: [newHistory, ...(activeChallenge.history || [])]
                });
            } else {
                const newRoutineItem = {
                    id: crypto.randomUUID(),
                    text: taskData.text || 'Untitled Protocol',
                    time: taskData.scheduledTime
                };
                const updatedRoutine = [...activeChallenge.dailyRoutine, newRoutineItem];

                const updatedProgress = { ...activeChallenge.dailyProgress };
                Object.keys(updatedProgress).forEach(day => {
                    updatedProgress[Number(day)] = [...updatedProgress[Number(day)], false];
                });

                const newHistory: HistoryRecord = {
                    id: crypto.randomUUID(),
                    type: 'add',
                    taskId: newRoutineItem.id,
                    taskText: newRoutineItem.text,
                    timestamp: Date.now(),
                    details: `New global task: "${newRoutineItem.text}" scheduled for ${newRoutineItem.time || 'Anytime'}`
                };

                onUpdateChallenge({
                    ...activeChallenge,
                    dailyRoutine: updatedRoutine,
                    dailyProgress: updatedProgress,
                    history: [newHistory, ...(activeChallenge.history || [])]
                });
            }
            setIsModalOpen(false);
            return;
        }

        if (taskData.id) {
            onUpdate(taskData.id, taskData);
        } else {
            onAdd(taskData);
        }
        setIsModalOpen(false);
    };

    const handleToggleTask = (id: string) => {
        if (id.startsWith('protocol-')) {
            const idx = parseInt(id.split('-')[1]);
            if (!activeChallenge) return;
            const diff = differenceInDays(selectedDate, parseISO(activeChallenge.startDate)) + 1;

            const selectedDateMidnight = new Date(selectedDate);
            selectedDateMidnight.setHours(0, 0, 0, 0);

            if (selectedDateMidnight.getTime() !== today_raw.getTime()) return;

            const currentDayProgress = activeChallenge.dailyProgress[diff] || new Array(activeChallenge.dailyRoutine.length).fill(false);
            const newDayProgress = [...currentDayProgress];
            newDayProgress[idx] = !newDayProgress[idx];

            const updatedProgress = { ...activeChallenge.dailyProgress, [diff]: newDayProgress };
            const allTasksCompleted = newDayProgress.length === activeChallenge.dailyRoutine.length && newDayProgress.every(done => done);

            let newCompletedDays = activeChallenge.completedDays;
            if (allTasksCompleted) {
                if (!newCompletedDays.includes(diff)) newCompletedDays = [...newCompletedDays, diff];
            } else {
                newCompletedDays = newCompletedDays.filter(d => d !== diff);
            }

            onUpdateChallenge({
                ...activeChallenge,
                dailyProgress: updatedProgress,
                completedDays: newCompletedDays
            });
            return;
        }
        onToggle(id);
    };

    const handleDeleteTask = (id: string) => {
        if (id.startsWith('protocol-')) {
            const idx = parseInt(id.split('-')[1]);
            if (!activeChallenge) return;
            const updatedRoutine = activeChallenge.dailyRoutine.filter((_, i) => i !== idx);

            const updatedProgress: Record<number, boolean[]> = {};
            Object.entries(activeChallenge.dailyProgress).forEach(([day, progress]) => {
                updatedProgress[Number(day)] = (progress as any).filter((_: any, i: any) => i !== idx);
            });

            const taskToDelete = activeChallenge.dailyRoutine[idx];
            const newHistory: HistoryRecord = {
                id: crypto.randomUUID(),
                type: 'delete',
                taskId: id,
                taskText: taskToDelete.text,
                timestamp: Date.now(),
                details: `Deleted protocol task: ${taskToDelete.text}`
            };

            const isRoutineEmpty = updatedRoutine.length === 0;

            onUpdateChallenge({
                ...activeChallenge,
                dailyRoutine: updatedRoutine,
                dailyProgress: isRoutineEmpty ? {} : updatedProgress,
                completedDays: isRoutineEmpty ? [] : activeChallenge.completedDays,
                history: [newHistory, ...(activeChallenge.history || [])]
            });
            return;
        }
        onDelete(id);
    };

    const getDayTasks = (date: Date) => {
        const dayDateStr = format(date, 'yyyy-MM-dd');
        const diff = activeChallenge ? differenceInDays(date, parseISO(activeChallenge.startDate)) + 1 : 0;
        const isProtocolDay = activeChallenge && diff >= 1 && diff <= activeChallenge.days;

        const regularTasksForDay = safeTasks.filter(t => t.scheduledDate === dayDateStr);

        const protocolTasks = isProtocolDay ? activeChallenge!.dailyRoutine.map((item, idx) => {
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

        // Return incomplete tasks preferably, or all? Usually import implies "to do".
        // But the previous import logic filtered out completed? No, PomodoroView filters filtering importCandidates?
        // Let's return all, let Pomodoro filter.
        return (taskTypeFilter === 'normal' ? regularTasksForDay : protocolTasks).sort((a, b) => {
            const timeA = a.scheduledTime || '99:99';
            const timeB = b.scheduledTime || '99:99';
            return timeA.localeCompare(timeB);
        });
    };

    return (
        <>
            <div className="w-full flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                    <button
                        onClick={() => setViewMode('week')}
                        className={`text-sm font-medium transition-colors dark:hover:text-white hover:text-slate-900 cursor-pointer ${viewMode === 'week' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`}
                    >
                        Plan Overview
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
                    <button
                        onClick={() => setViewMode('day')}
                        className={`text-sm font-medium transition-colors dark:hover:text-white hover:text-slate-900 cursor-pointer ${viewMode === 'day' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`}
                    >
                        Day Planner
                    </button>
                    {activeChallenge && (
                        <>
                            <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
                            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                                <Target size={12} className="text-cyan-400" />
                                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{activeChallenge.title} Active</span>
                            </div>
                        </>
                    )}
                </div>

                {viewMode === 'week' ? (
                    <div className="space-y-4">
                        {/* List Format: Create New Challenge */}
                        <div
                            onClick={() => setIsChallengeModalOpen(true)}
                            className="group bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-cyan-500/40 transition-all cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="text-cyan-600 dark:text-cyan-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Initiate New Protocol</h3>
                                <p className="text-slate-500 text-xs">Forge new habits and master your discipline.</p>
                            </div>
                        </div>

                        {/* Existing Challenges List */}
                        <div className="flex flex-col gap-3">
                            {safeChallenges.map((c) => {
                                const progress = Math.round((c.completedDays.length / c.days) * 100);
                                return (
                                    <div
                                        key={c.id}
                                        className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl dark:shadow-none hover:border-cyan-500/30 transition-all flex items-center gap-6"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                            <Target className="text-cyan-600 dark:text-cyan-400" size={24} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{c.title}</h3>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                                                <span>{c.days} Days Total</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                <span className="text-cyan-600 dark:text-cyan-400">{c.completedDays.length} Done</span>
                                            </div>
                                        </div>

                                        <div className="hidden md:block w-64 space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold font-mono tracking-tighter">
                                                <span className="text-slate-500 dark:text-slate-400 uppercase">Success Rate</span>
                                                <span className="text-cyan-600 dark:text-cyan-400">{progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                onSelectChallenge(c.id);
                                                onViewChange('disciplined');
                                            }}
                                            className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-cyan-600 hover:text-white text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-slate-200 dark:border-transparent"
                                        >
                                            View
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Horizontal Protocol Header */}
                        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar no-scrollbar pb-1">
                                <button
                                    onClick={() => setTaskTypeFilter('normal')}
                                    className={`shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${taskTypeFilter === 'normal' ? 'bg-cyan-600 dark:bg-cyan-500/10 border-cyan-700 dark:border-cyan-500/30 text-white dark:text-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                                >
                                    <TrendingUp size={16} className={taskTypeFilter === 'normal' ? 'text-white dark:text-cyan-400' : ''} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Manual Schedule</span>
                                </button>

                                {safeChallenges.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            onSelectChallenge(c.id);
                                            setTaskTypeFilter('disciplined');
                                        }}
                                        className={`shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${taskTypeFilter === 'disciplined' && activeChallenge?.id === c.id ? 'bg-cyan-600 dark:bg-cyan-500 border-cyan-700 dark:border-cyan-500 text-white dark:text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                                    >
                                        <Target size={16} />
                                        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">{c.title}</span>
                                    </button>
                                ))}

                                <button
                                    onClick={() => setIsChallengeModalOpen(true)}
                                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                                >
                                    <Plus size={14} />
                                    Launch New
                                </button>
                            </div>
                        </div>

                        {activeChallenge && taskTypeFilter === 'disciplined' && (
                            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 flex items-center gap-8 animate-fade-in shadow-xl dark:shadow-black/20">
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Protocol Focus</span>
                                            <button
                                                onClick={() => onViewChange('disciplined')}
                                                className="group flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white leading-none hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left cursor-pointer"
                                            >
                                                {activeChallenge.title}
                                                <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600 dark:text-cyan-400" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block mb-1">Success Velocity</span>
                                            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{Math.round((activeChallenge.completedDays.length / activeChallenge.days) * 100)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-[2px] border border-slate-200 dark:border-white/5">
                                        <div
                                            className="h-full bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-1000"
                                            style={{ width: `${Math.round((activeChallenge.completedDays.length / activeChallenge.days) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-slate-200 dark:bg-white/10 hidden sm:block" />
                                <div className="hidden sm:flex flex-col items-center justify-center shrink-0 min-w-[80px]">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Time Elapsed</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{Math.max(0, differenceInDays(selectedDate, parseISO(activeChallenge.startDate)) + 1)}</span>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase">/ {activeChallenge.days}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[calc(100vh-22rem)]">
                            <div className="lg:col-span-1 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 p-4 h-80 lg:h-auto flex flex-col gap-4 overflow-hidden shadow-lg dark:shadow-none">
                                <div className="flex-1 flex flex-col min-h-0">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Upcoming Schedule</h3>
                                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                                        {dates.map((date) => {
                                            const isSelected = isSameDay(date, selectedDate);
                                            return (
                                                <button
                                                    key={date.toString()}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                                                        ? 'bg-cyan-600 dark:bg-cyan-500/10 border-cyan-700 dark:border-cyan-500/50 text-white shadow-md'
                                                        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-semibold">{format(date, 'EEEE')}</span>
                                                        <span className="text-xs opacity-70">{format(date, 'MMMM d')}</span>
                                                    </div>
                                                    {isSelected && <ChevronRight size={16} className="text-cyan-400" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Jump to Date</h3>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={format(selectedDate, 'yyyy-MM-dd')}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setSelectedDate(new Date(e.target.value));
                                                }
                                            }}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all dark:scheme-dark"
                                        />
                                        <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-6 overflow-y-auto custom-scrollbar relative min-h-[500px] lg:min-h-0 h-auto lg:h-full shadow-lg dark:shadow-none">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2 mb-1 text-slate-900 dark:text-white">
                                            <CalendarIcon size={24} className="text-cyan-600 dark:text-cyan-400" />
                                            {format(selectedDate, 'EEEE')}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 ml-8">{format(selectedDate, 'MMM do, yyyy')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex flex-col items-end mr-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Plan</span>
                                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{taskTypeFilter === 'normal' ? 'Manual Schedule' : activeChallenge?.title}</span>
                                        </div>
                                        <button
                                            onClick={() => handleAddTask(format(selectedDate, 'yyyy-MM-dd'))}
                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20 font-medium text-sm cursor-pointer"
                                        >
                                            <Plus size={16} />
                                            Add Task
                                        </button>
                                        {onNavigateToPomodoro && (
                                            <button
                                                onClick={() => onNavigateToPomodoro(getDayTasks(selectedDate))}
                                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 rounded-lg transition-all font-medium text-sm cursor-pointer"
                                            >
                                                <Target size={16} className="text-cyan-600 dark:text-cyan-400" />
                                                Start Focus
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-0.5 relative">
                                    {(() => {
                                        const dayTasks = getDayTasks(selectedDate);

                                        return (
                                            <div className="flex flex-col space-y-3">
                                                {dayTasks.length > 0 ? (
                                                    dayTasks.map(task => (
                                                        <div key={task.id} className="flex gap-4 group">
                                                            <div className="w-[70px] text-right pt-3 shrink-0">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                                    {task.scheduledTime ? format(new Date(`2000-01-01T${task.scheduledTime}`), 'h:mm a') : 'Anytime'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <TimelineTaskItem
                                                                    task={task}
                                                                    onEdit={handleEditTask}
                                                                    onToggle={handleToggleTask}
                                                                    onDelete={handleDeleteTask}
                                                                    isEditable={isSameDay(selectedDate, effectiveToday)}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                            <Plus size={32} className="text-slate-400 dark:text-slate-500" />
                                                        </div>
                                                        <p className="text-slate-500 font-medium">No tasks for this day</p>
                                                        <button
                                                            onClick={() => handleAddTask(format(selectedDate, 'yyyy-MM-dd'))}
                                                            className="mt-4 text-cyan-600 dark:text-cyan-400 text-sm hover:underline cursor-pointer font-bold"
                                                        >
                                                            Schedule a task
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                initialData={editingTask}
                defaultDate={modalDefaultDate}
                defaultTime={modalDefaultTime}
                restrictToTime={false}
            />
            <ChallengeCreationModal
                isOpen={isChallengeModalOpen}
                onClose={() => setIsChallengeModalOpen(false)}
                onSave={(newChallenge) => {
                    onUpdateChallenge(newChallenge);
                    setIsChallengeModalOpen(false);
                }}
            />
        </>
    );
};

const TimelineTaskItem: React.FC<{
    task: Task;
    onEdit: (t: Task) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    isEditable: boolean;
}> = ({ task, onEdit, onToggle, onDelete, isEditable }) => {
    const isProtocol = !!(task as any).isProtocol;
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm transition-all group/item ${task.completed
                ? 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 opacity-60 shadow-none'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm hover:shadow-lg transition-all duration-300'
                }`}
        >
            <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
                <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-200'}`}>
                        {task.text}
                    </h4>
                    {isProtocol && (
                        <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 rounded border border-cyan-200 dark:border-cyan-500/20 uppercase tracking-tighter">Protocol</span>
                    )}
                </div>
                {task.scheduledTime && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {format(new Date(`2000-01-01T${task.scheduledTime}`), 'h:mm a')}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                    title="Edit Task"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete Task"
                >
                    <Trash2 size={14} />
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
                <button
                    onClick={(e) => { e.stopPropagation(); isEditable && onToggle(task.id); }}
                    disabled={!isEditable}
                    className={`p-2 rounded-lg border transition-all ${task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white dark:text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : isEditable
                            ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-500 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        }`}
                >
                    <Check size={16} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};
