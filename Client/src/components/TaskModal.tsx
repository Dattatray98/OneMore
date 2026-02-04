import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { X, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    initialData?: Partial<Task>;
    defaultDate?: string;
    defaultTime?: string;
    restrictToTime?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    defaultDate,
    defaultTime,
    restrictToTime = false
}) => {
    const [text, setText] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            setText(initialData?.text || '');
            setDate(initialData?.scheduledDate || defaultDate || format(new Date(), 'yyyy-MM-dd'));
            setTime(initialData?.scheduledTime || defaultTime || '09:00');
        }
    }, [isOpen, initialData, defaultDate, defaultTime]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...initialData,
            text,
            scheduledDate: date,
            scheduledTime: time
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                    {initialData?.id ? (restrictToTime ? 'Update Protocol Time' : 'Edit Task') : 'New Task'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Task Name</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={restrictToTime}
                            className={`w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all ${restrictToTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="What needs to be done?"
                            autoFocus={!restrictToTime}
                        />
                        {restrictToTime && <p className="text-[10px] text-cyan-400/50 mt-1 font-medium uppercase tracking-tighter">Protocol titles are fixed</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                            <div className="relative">
                                <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    disabled={restrictToTime}
                                    className={`w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all dark:scheme-dark ${restrictToTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Time</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all dark:scheme-dark"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-500/20 transition-all"
                        >
                            {initialData?.id ? 'Save Changes' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
