import React, { useEffect, useState } from 'react';
import type { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { TaskInput } from '../components/TaskInput';
import { TaskModal } from '../components/TaskModal';
import { Sidebar } from '../components/Sidebar';
import { format } from 'date-fns';
import { Target } from 'lucide-react';

import { PlannedTasks } from '../components/PlannedTasks';
import { DisciplinedView } from '../components/DisciplinedView';
import { PomodoroView } from '../components/PomodoroView';
import type { Challenge } from '../types';
import { SettingsView } from '../components/SettingsView';
import { api } from '../api';

interface HomeProps {
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const Home: React.FC<HomeProps> = ({ theme, setTheme }) => {
    // ROUTING & STATE
    // ================
    const [currentView, setCurrentView] = useState<'my-day' | 'pomodoro' | 'planned' | 'disciplined' | 'settings'>(() => {
        return (localStorage.getItem('current_view') as any) || 'my-day';
    });

    const [tasks, setTasks] = useState<Task[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);

    const [activeChallengeId, setActiveChallengeId] = useState<string | null>(() => {
        return localStorage.getItem('active_challenge_id');
    });

    // LOAD DATA FROM SQLITE
    useEffect(() => {
        const loadData = async () => {
            try {
                const [dbTasks, dbChallenges] = await Promise.all([
                    api.getTasks(),
                    api.getChallenges()
                ]);

                // Optional Migration: If DB is empty but localStorage has data
                if (dbTasks.length === 0 && dbChallenges.length === 0) {
                    const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                    const localChallenges = JSON.parse(localStorage.getItem('one_more_challenges') || '[]');

                    if (localTasks.length > 0 || localChallenges.length > 0) {
                        console.log('Migrating data to SQLite...');
                        await Promise.all([
                            ...localTasks.map((t: Task) => api.addTask(t)),
                            ...localChallenges.map((c: Challenge) => api.addChallenge(c))
                        ]);
                        const [newTasks, newChallenges] = await Promise.all([
                            api.getTasks(),
                            api.getChallenges()
                        ]);
                        setTasks(newTasks);
                        setChallenges(newChallenges);
                        return;
                    }
                }

                setTasks(dbTasks);
                setChallenges(dbChallenges);
            } catch (error) {
                console.error('Failed to load data from SQLite:', error);
            }
        };
        loadData();
    }, []);

    const activeChallenge = challenges.find(c => c.id === activeChallengeId) || challenges[0] || null;


    const [plannedFilter, setPlannedFilter] = useState<'normal' | 'disciplined'>('normal');
    const [plannedViewMode, setPlannedViewMode] = useState<'week' | 'day'>('week');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [prefilledTaskText, setPrefilledTaskText] = useState('');

    const [pomodoroAutoImport, setPomodoroAutoImport] = useState<'my-day' | 'protocol' | 'direct' | null>(null);
    const [pomodoroDirectTasks, setPomodoroDirectTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (currentView !== 'pomodoro') {
            setPomodoroAutoImport(null);
            setPomodoroDirectTasks([]);
        }
    }, [currentView]);

    useEffect(() => {
        localStorage.setItem('current_view', currentView);
    }, [currentView]);

    useEffect(() => {
        if (activeChallengeId) {
            localStorage.setItem('active_challenge_id', activeChallengeId);
        } else {
            localStorage.removeItem('active_challenge_id');
        }
    }, [activeChallengeId]);

    const handleUpdateChallenge = async (updated: Challenge | null) => {
        if (!updated) {
            // Delete case
            if (activeChallengeId) {
                const idToDelete = activeChallengeId;
                setChallenges(prev => prev.filter(c => c.id !== idToDelete));
                setActiveChallengeId(null);
                await api.deleteChallenge(idToDelete);
            }
            return;
        }

        const exists = challenges.find(c => c.id === updated.id);
        if (exists) {
            setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c));
            await api.updateChallenge(updated.id, updated);
        } else {
            setChallenges(prev => [...prev, updated]);
            await api.addChallenge(updated);
        }
        setActiveChallengeId(updated.id);
    };

    const handleSelectChallenge = (id: string) => {
        setActiveChallengeId(id);
    };



    const addTask = async (taskOrText: string | Partial<Task>) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            text: typeof taskOrText === 'string' ? taskOrText : taskOrText.text || '',
            completed: false,
            createdAt: Date.now(),
            scheduledDate: format(new Date(), 'yyyy-MM-dd'),
            ...(typeof taskOrText === 'object' ? taskOrText : {}),
        };
        setTasks((prev) => [newTask, ...prev]);
        await api.addTask(newTask);
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
        await api.updateTask(id, updates);
    };

    const toggleTask = (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            updateTask(id, { completed: !task.completed });
        }
    };

    const deleteTask = async (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        await api.deleteTask(id);
    };

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    const today = new Date();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-cyan-500 selection:text-cyan-950 flex font-sans transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar currentView={currentView} onViewChange={(v) => setCurrentView(v as any)} />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Background Ambience (Specific to Home) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/10 rounded-full blur-[100px] opacity-100 dark:opacity-100" />
                    <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[100px] opacity-100 dark:opacity-100" />
                    {/* Extra subtle light mode gradient */}
                    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-400/10 rounded-full blur-[120px] dark:hidden" />
                </div>

                <div className="mx-auto max-w-full">
                    {/* Header Section */}
                    <div className={`flex items-center justify-between ${currentView === 'disciplined' ? 'mb-8' : 'mb-6'}`}>
                        <div>
                            <h1 className="text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-linear-to-r from-slate-900 dark:from-white to-slate-500 dark:to-slate-400">
                                {currentView === 'my-day' && 'My Day'}
                                {currentView === 'pomodoro' && 'Pomodoro Focus'}
                                {currentView === 'planned' && 'Planned Tasks'}
                                {currentView === 'disciplined' && 'Disciplined'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                {currentView === 'my-day'
                                    ? format(today, 'EEEE, MMMM do')
                                    : 'Overview of your schedule'
                                }
                            </p>
                        </div>
                    </div>

                    {currentView === 'my-day' && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Main Task Column */}
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
                                    {tasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-30 space-y-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl border-dashed">
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                                                <span className="text-3xl">📝</span>
                                            </div>
                                            <p className="text-lg text-slate-400 dark:text-slate-500 font-medium">No tasks yet. Enjoy your day!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Active Tasks */}
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

                                            {/* Completed Tasks */}
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

                            {/* Right Side Sidebar Widgets */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Discipline Preview */}
                                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-none relative overflow-hidden group transition-colors duration-300">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Target size={64} className="text-cyan-400" />
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Active Protocol</h3>
                                    {activeChallenge ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{activeChallenge.title}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1">{activeChallenge.description}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold font-mono">
                                                    <span className="text-slate-500">GLOBAL PROGRESS</span>
                                                    <span className="text-cyan-600 dark:text-cyan-400">{Math.round((activeChallenge.completedDays.length / activeChallenge.days) * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                                        style={{ width: `${(activeChallenge.completedDays.length / activeChallenge.days) * 100}%` }}
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

                                {/* Task Stats Preview */}
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
                                    {tasks.length > 0 && (
                                        <div className="mt-6 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-bold font-mono">
                                                    <span className="text-slate-500">TASK VELOCITY</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400">{Math.round((completedTasks.length / tasks.length) * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                                        style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => { setPomodoroAutoImport('my-day'); setCurrentView('pomodoro'); }}
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
                            activeChallenge={activeChallenge}
                            onUpdateChallenge={handleUpdateChallenge}
                            onSelectChallenge={handleSelectChallenge}
                            filter={plannedFilter}
                            onFilterChange={setPlannedFilter}
                            viewMode={plannedViewMode}
                            onViewModeChange={setPlannedViewMode}
                            onViewChange={(v) => setCurrentView(v as any)}
                            onNavigateToPomodoro={(tasksToImport) => {
                                setPomodoroDirectTasks(tasksToImport);
                                setPomodoroAutoImport('direct');
                                setCurrentView('pomodoro');
                            }}
                        />
                    )}

                    {currentView === 'disciplined' && (
                        <DisciplinedView
                            challenge={activeChallenge}
                            onUpdateChallenge={handleUpdateChallenge}
                            onNavigateToPlanner={(filter, view) => {
                                if (filter) setPlannedFilter(filter);
                                if (view) setPlannedViewMode(view);
                                setCurrentView('planned');
                            }}
                            onNavigateToPomodoro={() => {
                                setPomodoroAutoImport('protocol');
                                setCurrentView('pomodoro');
                            }}
                        />
                    )}

                    {currentView === 'pomodoro' && (
                        <PomodoroView
                            tasks={tasks}
                            activeChallenge={activeChallenge}
                            onToggleTask={toggleTask}
                            onUpdateTask={updateTask}
                            onAddTask={addTask}
                            initialAutoImport={pomodoroAutoImport}
                            directImportTasks={pomodoroDirectTasks}
                        />
                    )}

                    {currentView === 'settings' && <SettingsView theme={theme} setTheme={setTheme} />}
                </div>
            </main>
            {/* Add Task Modal for Advanced Input */}
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
