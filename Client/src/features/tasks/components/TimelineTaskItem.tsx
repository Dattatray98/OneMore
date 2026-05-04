import React, { useState } from 'react';
import { Edit2, Trash2, X, Clock, MoreVertical, Check } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '../../../types';

export interface TimelineTaskItemProps {
    task: Task;
    onEdit: (t: Task) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    isEditable: boolean;
}

export const TimelineTaskItem: React.FC<TimelineTaskItemProps> = ({ task, onEdit, onToggle, onDelete, isEditable }) => {
    const isProtocol = !!(task as any).isProtocol;
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div
            className={`relative flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm transition-all group/item ${task.completed
                ? 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 opacity-60 shadow-none'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm hover:shadow-lg transition-all duration-300'
                }`}
        >
            {showMenu ? (
                <div className="flex-1 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(task); setShowMenu(false); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-cyan-500 hover:text-white text-slate-600 dark:text-slate-300 rounded-lg transition-colors text-xs font-bold"
                        >
                            <Edit2 size={14} />
                            Edit
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(task.id); setShowMenu(false); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 rounded-lg transition-colors text-xs font-bold"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(task)}>
                        <div className="flex items-center gap-2 mb-1">
                            {task.scheduledTime ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 font-mono bg-cyan-50 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-100 dark:border-cyan-500/20">
                                    <Clock size={10} />
                                    {format(new Date(`2000-01-01T${task.scheduledTime}`), 'h:mm a')}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-white/5">
                                    <Clock size={10} />
                                    Anytime
                                </span>
                            )}
                            {isProtocol && (
                                <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded border border-purple-200 dark:border-purple-500/20 uppercase tracking-tighter">Protocol</span>
                            )}
                        </div>
                        <h4 className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-200'}`}>
                            {task.text}
                        </h4>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-100 md:opacity-0 group-hover/item:opacity-100"
                        >
                            <MoreVertical size={16} />
                        </button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
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
                </>
            )}
        </div>
    );
};
