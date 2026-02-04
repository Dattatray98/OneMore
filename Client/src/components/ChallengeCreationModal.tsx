import React, { useState } from 'react';
import { Target, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import type { Challenge } from '../types';

interface ChallengeCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (challenge: Challenge) => void;
}

export const ChallengeCreationModal: React.FC<ChallengeCreationModalProps> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dailyRoutine, setDailyRoutine] = useState<{ id: string; text: string; time?: string }[]>([]);
    const [newTask, setNewTask] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [daysInput, setDaysInput] = useState('30');
    const [refreshTime, setRefreshTime] = useState('00:00');

    if (!isOpen) return null;

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

    const handleSubmit = (e: React.FormEvent) => {
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

        onSave(newChallenge);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/50 backdrop-blur-sm animate-fade-in">
            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <Target className="text-cyan-600 dark:text-cyan-400" size={24} />
                            </div>
                            Forge New Protocol
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Protocol Identification</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Summer Shred, Deep Work 4H"
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mission Objective</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Define your ultimate goal..."
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all min-h-[100px] resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Timeline (Days)</label>
                                        <input
                                            type="number"
                                            value={daysInput}
                                            onChange={(e) => setDaysInput(e.target.value)}
                                            min="1"
                                            max="365"
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Sync Time</label>
                                        <input
                                            type="time"
                                            value={refreshTime}
                                            onChange={(e) => setRefreshTime(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all dark:scheme-dark"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Daily Protocol Tasks</label>
                                <div className="bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 flex-1 flex flex-col overflow-hidden">
                                    <div className="p-3 border-b border-slate-200 dark:border-white/10 space-y-2">
                                        <input
                                            type="text"
                                            value={newTask}
                                            onChange={(e) => setNewTask(e.target.value)}
                                            placeholder="Task details..."
                                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/30 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addRoutineTask();
                                                }
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="time"
                                                    value={newTaskTime}
                                                    onChange={(e) => setNewTaskTime(e.target.value)}
                                                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/30 dark:scheme-dark"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addRoutineTask}
                                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                                        {dailyRoutine.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                                                <Plus size={24} className="mb-2" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest">No routine tasks defined</p>
                                            </div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {dailyRoutine.map((task, index) => (
                                                    <li key={task.id} className="flex items-center justify-between group bg-white dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{task.text}</span>
                                                            {task.time && (
                                                                <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                                                                    {format(new Date(`2000-01-01T${task.time}`), 'h:mm a')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRoutineTask(index)}
                                                            className="p-1 hover:bg-red-500/10 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-white/10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(8,145,178,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Launch Protocol
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
