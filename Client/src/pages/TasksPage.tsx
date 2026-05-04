import React, { useState } from 'react';
import type { Task, Challenge } from '../types/index';
import { Calendar as CalendarIcon, ChevronRight, Plus, Target, TrendingUp, ArrowUpRight } from 'lucide-react';
import { format, isSameDay, differenceInDays, parseISO } from 'date-fns';
import { TaskModal } from '../features/tasks/components/TaskModal';
import { ChallengeCreationModal } from '../features/challenges/components/ChallengeCreationModal';
import { TimelineTaskItem } from '../features/tasks/components/TimelineTaskItem';
import { PlanOverview } from '../features/challenges/components/PlanOverview';
import * as taskService from '../services/taskService';
import * as challengeService from '../services/challengeService';
import { useChallengeStore } from '../store/useChallengeStore';
import { useViewStore } from '../store/useViewStore';

interface PlannedTasksProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onAdd: (taskOrText: string | Partial<Task>) => void;
    onDelete: (id: string) => void;
    challenges: Challenge[];
    onUpdateChallenge: (challenge: Challenge | null, idToDelete?: string) => void;
}

export const TasksPage: React.FC<PlannedTasksProps> = ({
    tasks, onToggle, onUpdate, onAdd, onDelete, challenges, onUpdateChallenge
}) => {
    const { getActiveChallenge, setActiveChallengeId, plannedFilter: filter, setPlannedFilter: onFilterChange, plannedViewMode: viewMode, setPlannedViewMode: onViewModeChange } = useChallengeStore();
    const { setCurrentView: onViewChange, setPomodoroImport } = useViewStore();
    const activeChallenge = getActiveChallenge();

    const onSelectChallenge = (id: string) => setActiveChallengeId(id);
    const onNavigateToPomodoro = (tasksToImport: Task[]) => {
        setPomodoroImport('direct', tasksToImport);
        onViewChange('pomodoro');
    };
    const effectiveToday = taskService.getEffectiveDate(new Date(), activeChallenge);
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
    const normalDates = taskService.getNormalTaskDates(safeTasks, today_raw);

    // 2. Discipline Protocol Dates (Active Challenge active period)
    const disciplineDates = taskService.getDisciplineDates(activeChallenge, today_raw);

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
            const updates = challengeService.handleProtocolTaskSaveLogic(activeChallenge, taskData, selectedDate);
            onUpdateChallenge({ ...activeChallenge, ...updates });
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

            const updates = challengeService.toggleRoutineTaskLogic(activeChallenge, diff, idx, diff);
            if (updates) {
                onUpdateChallenge({ ...activeChallenge, ...updates });
            }
            return;
        }
        onToggle(id);
    };

    const handleDeleteTask = (id: string) => {
        if (id.startsWith('protocol-')) {
            if (!activeChallenge) return;
            const updates = challengeService.handleProtocolTaskDeleteLogic(activeChallenge, id);
            onUpdateChallenge({ ...activeChallenge, ...updates });
            return;
        }
        onDelete(id);
    };

    const getDayTasks = (date: Date) => taskService.getDayTasksLogic(safeTasks, date, activeChallenge, taskTypeFilter);

    return (
        <>
            <div className="w-full flex flex-col gap-4 md:gap-6 animate-fade-in pb-20 md:pb-0">
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4 overflow-x-auto hide-scrollbar whitespace-nowrap">
                    <button
                        onClick={() => setViewMode('week')}
                        className={`text-sm font-medium transition-colors dark:hover:text-white hover:text-slate-900 cursor-pointer shrink-0 ${viewMode === 'week' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`}
                    >
                        Plan Overview
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0" />
                    <button
                        onClick={() => setViewMode('day')}
                        className={`text-sm font-medium transition-colors dark:hover:text-white hover:text-slate-900 cursor-pointer shrink-0 ${viewMode === 'day' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}`}
                    >
                        Day Planner
                    </button>
                    {activeChallenge && (
                        <>
                            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 shrink-0" />
                            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 shrink-0">
                                <Target size={12} className="text-cyan-400" />
                                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{activeChallenge.title} Active</span>
                            </div>
                        </>
                    )}
                </div>

                {viewMode === 'week' ? (
                    <PlanOverview
                        challenges={safeChallenges}
                        setIsChallengeModalOpen={setIsChallengeModalOpen}
                        onSelectChallenge={onSelectChallenge}
                        onViewChange={onViewChange}
                    />
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Horizontal Protocol Header */}
                        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
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
                            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 md:px-6 md:py-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-8 animate-fade-in shadow-xl dark:shadow-black/20">
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Protocol Focus</span>
                                            <button
                                                onClick={() => onViewChange('disciplined')}
                                                className="group flex items-center gap-2 text-base md:text-lg font-bold text-slate-900 dark:text-white leading-none hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left cursor-pointer truncate"
                                            >
                                                <span className="truncate">{activeChallenge.title}</span>
                                                <ArrowUpRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600 dark:text-cyan-400" />
                                            </button>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
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
                                <div className="w-full h-px md:w-px md:h-12 bg-slate-200 dark:bg-white/10" />
                                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center shrink-0 md:min-w-[80px]">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0 md:mb-1">Time Elapsed</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">{Math.max(0, differenceInDays(selectedDate, parseISO(activeChallenge.startDate)) + 1)}</span>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase">/ {activeChallenge.days}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 h-auto lg:h-[calc(100vh-22rem)]">
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

                            <div className="lg:col-span-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/10 p-4 md:p-6 overflow-y-auto custom-scrollbar relative min-h-[400px] lg:min-h-0 h-auto lg:h-full shadow-lg dark:shadow-none">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 mb-1 text-slate-900 dark:text-white">
                                            <CalendarIcon size={20} className="md:w-6 md:h-6 text-cyan-600 dark:text-cyan-400" />
                                            {format(selectedDate, 'EEEE')}
                                        </h3>
                                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 ml-7 md:ml-8">{format(selectedDate, 'MMM do, yyyy')}</p>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <div className="hidden sm:flex flex-col items-end mr-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Plan</span>
                                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{taskTypeFilter === 'normal' ? 'Manual Schedule' : activeChallenge?.title}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddTask(format(selectedDate, 'yyyy-MM-dd'));
                                            }}
                                            className="relative z-10 flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20 font-medium text-xs md:text-sm cursor-pointer active:scale-95"
                                        >
                                            <Plus size={14} className="md:w-4 md:h-4" />
                                            Add Task
                                        </button>
                                        {onNavigateToPomodoro && (
                                            <button
                                                onClick={() => onNavigateToPomodoro(getDayTasks(selectedDate))}
                                                className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 rounded-lg transition-all font-medium text-xs md:text-sm cursor-pointer"
                                            >
                                                <Target size={14} className="md:w-4 md:h-4 text-cyan-600 dark:text-cyan-400" />
                                                <span className="hidden sm:inline">Start Focus</span>
                                                <span className="sm:hidden">Focus</span>
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
                                                        <TimelineTaskItem
                                                            key={task.id}
                                                            task={task}
                                                            onEdit={handleEditTask}
                                                            onToggle={handleToggleTask}
                                                            onDelete={handleDeleteTask}
                                                            isEditable={isSameDay(selectedDate, effectiveToday)}
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                            <Plus size={32} className="text-slate-400 dark:text-slate-500" />
                                                        </div>
                                                        <p className="text-slate-500 font-medium">No tasks for this day</p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddTask(format(selectedDate, 'yyyy-MM-dd'));
                                                            }}
                                                            className="relative z-10 mt-4 text-cyan-600 dark:text-cyan-400 text-sm hover:underline cursor-pointer font-bold p-2"
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
            </div>

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
                onSave={(newChallenge: Challenge) => {
                    onUpdateChallenge(newChallenge);
                    setIsChallengeModalOpen(false);
                }}
            />
        </>
    );
};


