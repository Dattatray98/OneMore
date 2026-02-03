import React, { useEffect, useState } from 'react';
import type { Task } from '../types';
import { TaskItem } from '../components/TaskItem';
import { TaskInput } from '../components/TaskInput';
import { Sidebar } from '../components/Sidebar';
import { format } from 'date-fns';

import { Challenges } from '../components/Challenges';

import { PlannedTasks } from '../components/PlannedTasks';
import { DisciplinedView } from '../components/DisciplinedView';

export const Home: React.FC = () => {
    // ROUTING & STATE
    // ================
    // currentView: Controls which dashboard section is active ('my-day', 'planned', 'disciplined')
    // activeTab: Sub-navigation within 'My Day' (Tasks vs Challenges)
    // tasks: Main task list state (persisted to localStorage)
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem('current_view') || 'my-day';
    });
    const [activeTab, setActiveTab] = useState<'tasks' | 'challenges'>(() => {
        return (localStorage.getItem('active_tab') as 'tasks' | 'challenges') || 'tasks';
    });
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('current_view', currentView);
    }, [currentView]);

    useEffect(() => {
        localStorage.setItem('active_tab', activeTab);
    }, [activeTab]);

    const addTask = (taskOrText: string | Partial<Task>) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            text: typeof taskOrText === 'string' ? taskOrText : taskOrText.text || '',
            completed: false,
            createdAt: Date.now(),
            ...(typeof taskOrText === 'object' ? taskOrText : {}),
        };
        setTasks((prev) => [newTask, ...prev]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    const toggleTask = (id: string) => {
        updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed });
    };

    const deleteTask = (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    const today = new Date();

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-cyan-950 flex font-sans">
            {/* Sidebar */}
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Background Ambience (Specific to Home) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
                </div>

                <div className={`mx-auto ${(currentView === 'planned' || currentView === 'disciplined') ? 'max-w-full' : 'max-w-4xl'}`}>
                    {/* Header Section */}
                    <div className={`flex items-center justify-between ${currentView === 'disciplined' ? 'mb-8' : 'mb-12'}`}>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">
                                {currentView === 'my-day' && 'My Day'}
                                {currentView === 'planned' && 'Planned Tasks'}
                                {currentView === 'important' && 'Important'}
                                {currentView === 'disciplined' && 'Disciplined'}
                            </h1>
                            <p className="text-slate-400">
                                {currentView === 'my-day'
                                    ? format(today, 'EEEE, MMMM do')
                                    : 'Overview of your schedule'
                                }
                            </p>
                        </div>

                        {/* Tab Switcher - Only show on My Day view */}
                        {currentView === 'my-day' && (
                            <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl backdrop-blur-sm">
                                <button
                                    onClick={() => setActiveTab('tasks')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks'
                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Tasks
                                </button>
                                <button
                                    onClick={() => setActiveTab('challenges')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'challenges'
                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Challenges
                                </button>
                            </div>
                        )}
                    </div>

                    {currentView === 'my-day' && activeTab === 'tasks' && (
                        <>
                            <TaskInput onAdd={addTask} />

                            <div className="space-y-6">
                                {tasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                                        <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center">
                                            <span className="text-6xl">📝</span>
                                        </div>
                                        <p className="text-xl text-slate-500 font-medium">No tasks yet. Enjoy your day!</p>
                                    </div>
                                )}

                                {/* Active Tasks */}
                                {activeTasks.length > 0 && (
                                    <div className="space-y-1 animate-fade-in">
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
                                    <div className="space-y-1 animate-fade-in">
                                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 mt-6 flex items-center gap-2">
                                            Completed <span>•</span> {completedTasks.length}
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
                        </>
                    )}

                    {currentView === 'my-day' && activeTab === 'challenges' && (
                        <Challenges />
                    )}

                    {currentView === 'planned' && (
                        <PlannedTasks
                            tasks={tasks}
                            onToggle={toggleTask}
                            onUpdate={updateTask}
                            onAdd={addTask}
                        />
                    )}

                    {currentView === 'disciplined' && (
                        <DisciplinedView />
                    )}

                    {currentView === 'important' && (
                        <div className="text-center py-20 text-slate-500">
                            Feature coming soon...
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
