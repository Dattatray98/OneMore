import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Task } from '../types/index';
import { TaskItem } from '../features/tasks/components/TaskItem';
import { useTaskQuery } from '../hooks/useTaskQuery';
import { useChallengeQuery } from '../hooks/useChallengeQuery';
import { TaskInput } from '../features/tasks/components/TaskInput';
import { TaskModal } from '../features/tasks/components/TaskModal';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { format } from 'date-fns';
import { Target } from 'lucide-react';
import { useViewStore } from '../store/useViewStore';
import { useChallengeStore } from '../store/useChallengeStore';

import { TasksPage as PlannedTasks } from './TasksPage';
import { ProtocolPage as DisciplinedView } from './ProtocolPage';
import { PomodoroPage as PomodoroView } from './PomodoroPage';
import type { Challenge } from '../types/index';
import { SettingsPage as SettingsView } from './SettingsPage';
import { generateId } from '../utils/id';

interface HomeProps {
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const Home: React.FC<HomeProps> = ({ theme, setTheme }) => {
    // ROUTING & STATE
    const { currentView, setCurrentView, setPomodoroImport } = useViewStore();
    const { activeChallengeId, setActiveChallengeId } = useChallengeStore();
    const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [prefilledTaskText, setPrefilledTaskText] = useState('');

    const {
        tasks,
        isLoading: tasksLoading,
        isError: tasksError,
        addTask: queryAddTask,
        updateTask: queryUpdateTask,
        deleteTask: queryDeleteTask,
        refetchTasks
    } = useTaskQuery();

    const {
        challenges,
        isLoading: challengesLoading,
        isError: challengesError,
        addChallenge: queryAddChallenge,
        updateChallenge: queryUpdateChallenge,
        deleteChallenge: queryDeleteChallenge
    } = useChallengeQuery();

    useEffect(() => {
        if (currentView !== 'pomodoro') {
            setPomodoroImport(null);
        }
    }, [currentView, setPomodoroImport]);

    const safeChallenges = useMemo(() => Array.isArray(challenges) ? challenges : [], [challenges]);
    const activeChallenge = useMemo(() => 
        safeChallenges.find(c => c.id === activeChallengeId) || safeChallenges[0] || null
    , [safeChallenges, activeChallengeId]);

    const handleUpdateChallenge = useCallback(async (updated: Challenge | null, idToDelete?: string) => {
        if (!updated) {
            const targetId = idToDelete || activeChallengeId || (safeChallenges.length > 0 ? safeChallenges[0].id : null);
            if (targetId) {
                if (activeChallengeId === targetId) setActiveChallengeId(null);
                await queryDeleteChallenge(targetId);
            }
            return;
        }

        const exists = safeChallenges.find(c => c.id === updated.id);
        if (exists) {
            await queryUpdateChallenge({ id: updated.id, challenge: updated });
        } else {
            await queryAddChallenge(updated);
        }
        setActiveChallengeId(updated.id);
    }, [safeChallenges, activeChallengeId, queryDeleteChallenge, queryUpdateChallenge, queryAddChallenge, setActiveChallengeId]);

    const addTask = useCallback(async (taskOrText: string | Partial<Task>) => {
        const newTask: Task = {
            id: generateId(),
            text: typeof taskOrText === 'string' ? taskOrText : taskOrText.text || '',
            completed: false,
            createdAt: Date.now(),
            scheduledDate: format(new Date(), 'yyyy-MM-dd'),
            ...(typeof taskOrText === 'object' ? taskOrText : {}),
        };
        await queryAddTask(newTask);
    }, [queryAddTask]);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        await queryUpdateTask({ id, updates });
    }, [queryUpdateTask]);

    const toggleTask = useCallback((id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            updateTask(id, { completed: !task.completed });
        }
    }, [tasks, updateTask]);

    const deleteTask = useCallback(async (id: string) => {
        await queryDeleteTask(id);
    }, [queryDeleteTask]);

    const safeTasks = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);

    const tasksForDay = useMemo(() => 
        safeTasks.filter(t => t.scheduledDate === selectedDate)
    , [safeTasks, selectedDate]);

    const tasksForActiveChallenge = useMemo(() => 
        tasksForDay.filter(t => activeChallengeId ? t.challengeId === activeChallengeId : true)
    , [tasksForDay, activeChallengeId]);

    const activeTasks = useMemo(() => tasksForActiveChallenge.filter(t => !t.completed), [tasksForActiveChallenge]);
    const completedTasks = useMemo(() => tasksForActiveChallenge.filter(t => t.completed), [tasksForActiveChallenge]);

    const today = new Date();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-cyan-500 selection:text-cyan-950 flex font-sans transition-colors duration-300">
            <Sidebar />
            <BottomNav />
            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pb-32 md:pb-8 relative overflow-y-auto overflow-x-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/10 rounded-full blur-[100px] opacity-100 dark:opacity-100" />
                    <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[100px] opacity-100 dark:opacity-100" />
                    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-400/10 rounded-full blur-[120px] dark:hidden" />
                </div>

                <div className="mx-auto max-w-full">
                    <div className={`flex items-center justify-between ${currentView === 'disciplined' ? 'mb-6 md:mb-8' : 'mb-4 md:mb-6'}`}>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-linear-to-r from-slate-900 dark:from-white to-slate-500 dark:to-slate-400">
                                {currentView === 'my-day' && 'My Day'}
                                {currentView === 'pomodoro' && 'Pomodoro Focus'}
                                {currentView === 'planned' && 'Planned Tasks'}
                                {currentView === 'disciplined' && 'Disciplined Protocol'}
                                {currentView === 'settings' && 'Settings'}
                            </h1>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                                {currentView === 'my-day'
                                    ? format(today, 'EEEE, MMMM do')
                                    : 'Overview of your schedule'
                                }
                            </p>
                        </div>
                    </div>

                    {currentView === 'my-day' && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-3 space-y-6">
                                <div className="flex justify-center">
                                    <TaskInput
                                        onAdd={addTask}
                                        onAdvancedAdd={(text) => {
                                            setPrefilledTaskText(text);
                                            setIsAddModalOpen(true);
                                        }}
                                    />
                                </div>

                                <div className="space-y-6">
                                    {tasksLoading ? (
                                        <div className="space-y-3 animate-pulse">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5" />
                                            ))}
                                        </div>
                                    ) : tasksError ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl space-y-4">
                                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                                                <span className="text-2xl">⚠️</span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-red-800 dark:text-red-300 font-bold">Failed to load tasks</p>
                                                <p className="text-red-600/70 dark:text-red-400/50 text-sm">Please check your connection or try again.</p>
                                            </div>
                                            <button 
                                                onClick={() => refetchTasks()}
                                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    ) : tasksForActiveChallenge.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-30 space-y-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl border-dashed group hover:opacity-50 transition-opacity cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-3xl">📝</span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg text-slate-400 dark:text-slate-500 font-medium">No tasks yet.</p>
                                                <p className="text-sm text-slate-400 dark:text-slate-500">Tap to create your first goal for today</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {activeTasks.length > 0 && (
                                                <div className="space-y-2 animate-fade-in">
                                                    {activeTasks.map((task) => (
                                                        <TaskItem
                                                            key={task.id}
                                                            task={task}
                                                            onToggle={toggleTask}
                                                            onDelete={deleteTask}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {completedTasks.length > 0 && (
                                                <div className="space-y-2 animate-fade-in">
                                                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-3">
                                                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                                                        Completed • {completedTasks.length}
                                                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                                                    </h2>
                                                    {completedTasks.map((task) => (
                                                        <TaskItem
                                                            key={task.id}
                                                            task={task}
                                                            onToggle={toggleTask}
                                                            onDelete={deleteTask}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-none relative overflow-hidden group transition-colors duration-300">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Target size={64} className="text-cyan-400" />
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Active Protocol</h3>
                                    
                                    {challengesLoading ? (
                                        <div className="space-y-4 animate-pulse">
                                            <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded-lg" />
                                            <div className="h-3 w-1/2 bg-slate-100 dark:bg-white/5 rounded-lg" />
                                            <div className="space-y-2 pt-2">
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full" />
                                            </div>
                                        </div>
                                    ) : challengesError ? (
                                        <div className="py-4 text-center">
                                            <p className="text-red-500 text-xs mb-2">Protocol load error</p>
                                        </div>
                                    ) : activeChallenge ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{activeChallenge.title}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1">{activeChallenge.description}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold font-mono">
                                                    <span className="text-slate-500">GLOBAL PROGRESS</span>
                                                    <span className="text-cyan-600 dark:text-cyan-400">
                                                        {activeChallenge.completedDays?.length ? Math.round((activeChallenge.completedDays.length / activeChallenge.days) * 100) : 0}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                                        style={{ width: `${activeChallenge.completedDays?.length ? (activeChallenge.completedDays.length / activeChallenge.days) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setCurrentView('disciplined')}
                                                className="w-full py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/5"
                                            >
                                                Open Protocol
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center">
                                            <p className="text-slate-500 text-sm mb-4">No active protocol</p>
                                            <button
                                                onClick={() => setCurrentView('planned')}
                                                className="px-4 py-2 bg-cyan-600/20 text-cyan-400 text-xs font-bold rounded-lg hover:bg-cyan-600 hover:text-white transition-all"
                                            >
                                                Start Protocol
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-none transition-colors duration-300">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Daily Outlook</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white block">{activeTasks.length}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remaining</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{completedTasks.length}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
                                        </div>
                                    </div>
                                    {tasksForActiveChallenge.length > 0 && (
                                        <div className="mt-6 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold font-mono">
                                                    <span className="text-slate-500">TASK VELOCITY</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400">{Math.round((completedTasks.length / tasksForActiveChallenge.length) * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                                        style={{ width: `${(completedTasks.length / tasksForActiveChallenge.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => { 
                                                    setPomodoroImport('my-day'); 
                                                    setCurrentView('pomodoro'); 
                                                }}
                                                className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                            >
                                                <Target size={14} />
                                                ENTER FOCUS MODE
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentView === 'planned' && (
                        <PlannedTasks
                            tasks={tasks}
                            onToggle={toggleTask}
                            onUpdate={updateTask}
                            onAdd={addTask}
                            onDelete={deleteTask}
                            challenges={challenges}
                            onUpdateChallenge={handleUpdateChallenge}
                        />
                    )}

                    {currentView === 'disciplined' && (
                        <DisciplinedView
                            challenge={activeChallenge}
                            onUpdateChallenge={handleUpdateChallenge}
                        />
                    )}

                    {currentView === 'pomodoro' && (
                        <PomodoroView
                            tasks={tasks}
                            activeChallenge={activeChallenge}
                            onToggleTask={toggleTask}
                            onUpdateTask={updateTask}
                            onAddTask={addTask}
                            onUpdateChallenge={handleUpdateChallenge}
                        />
                    )}

                    {currentView === 'settings' && <SettingsView theme={theme} setTheme={setTheme} />}
                </div>
            </main>
            <TaskModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setPrefilledTaskText('');
                }}
                onSave={(task) => {
                    addTask(task);
                    setIsAddModalOpen(false);
                    setPrefilledTaskText('');
                }}
                initialData={{ text: prefilledTaskText }}
                defaultDate={format(new Date(), 'yyyy-MM-dd')}
            />
        </div>
    );
};
