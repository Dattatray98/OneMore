import React from 'react';
import { ListTodo, ListPlus, Plus, X, Edit3, Trash2, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '../../../types';

export interface PomodoroSequenceProps {
    orderedTasks: (Task & { isProtocol?: boolean })[];
    newTaskText: string;
    setNewTaskText: (v: string) => void;
    handleCreateManualTask: (e: React.FormEvent) => void;
    setImportModal: (val: 'source-select') => void;
    editingTaskId: string | null;
    setEditingTaskId: (val: string | null) => void;
    editValue: string;
    setEditValue: (v: string) => void;
    editTime: string;
    setEditTime: (v: string) => void;
    handleSaveEdit: (id: string) => void;
    selectedTaskId: string | null;
    setSelectedTaskId: (id: string | null) => void;
    mode: 'work' | 'shortBreak' | 'longBreak';
    handleToggleLocal: (id: string) => void;
    removeTaskFromSequence: (idx: number) => void;
    moveTask: (idx: number, dir: 'up' | 'down') => void;
}

export const PomodoroSequence: React.FC<PomodoroSequenceProps> = ({
    orderedTasks,
    newTaskText,
    setNewTaskText,
    handleCreateManualTask,
    setImportModal,
    editingTaskId,
    setEditingTaskId,
    editValue,
    setEditValue,
    editTime,
    setEditTime,
    handleSaveEdit,
    selectedTaskId,
    setSelectedTaskId,
    mode,
    handleToggleLocal,
    removeTaskFromSequence,
    moveTask
}) => {
    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 h-[calc(100vh-28rem)] flex flex-col shadow-xl dark:shadow-none">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <ListTodo size={16} className="text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Today's Sequence</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{orderedTasks.length} Operations Pending</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setImportModal('source-select')}
                        className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-slate-200 dark:border-white/10"
                        title="Import Tasks"
                    >
                        <ListPlus size={16} />
                    </button>
                </div>
            </div>

            {/* Manual Task Input */}
            <form onSubmit={handleCreateManualTask} className="mb-4 relative group">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add sequence task..."
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-medium"
                />
                <Plus size={14} className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {orderedTasks.map((task, index) => (
                    <div key={task.id} className="relative group">
                        {editingTaskId === task.id ? (
                            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-cyan-500/50 rounded-2xl p-4 space-y-4 animate-fade-in">
                                <input
                                    autoFocus
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                                    placeholder="Task details..."
                                />
                                <input
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => handleSaveEdit(task.id)} className="flex-1 py-2 bg-cyan-600 text-white text-[10px] font-bold rounded-lg hover:bg-cyan-500 uppercase tracking-widest">Save</button>
                                    <button onClick={() => setEditingTaskId(null)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className={`w-full group/item text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${selectedTaskId === task.id
                                ? 'bg-cyan-500/5 border-cyan-500/30 dark:border-cyan-500/30'
                                : mode === 'work' ? 'bg-transparent border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/2 cursor-pointer' : 'bg-transparent border-slate-100 dark:border-white/5 opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => mode === 'work' && setSelectedTaskId(task.id)}>
                                    <div className={`w-1 h-8 rounded-full transition-colors ${selectedTaskId === task.id ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-white/10 group-hover/item:bg-slate-300 dark:group-hover/item:bg-white/20'}`} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-medium truncate ${selectedTaskId === task.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {task.text}
                                            </p>
                                            {task.isProtocol && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" title="Protocol Task" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                                                {task.scheduledTime ? format(new Date(`2000-01-01T${task.scheduledTime}`), 'h:mm a') : 'Flex'}
                                            </span>
                                            {task.completed && (
                                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 uppercase tracking-tighter">Done</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Controls */}
                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleLocal(task.id); }}
                                        className={`p-1.5 rounded-lg transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}
                                        title={task.completed ? "Mark as pending" : "Mark as completed"}
                                    >
                                        <CheckCircle2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => removeTaskFromSequence(index)}
                                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                                        title="Remove from sequence"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingTaskId(task.id);
                                            setEditValue(task.text);
                                            setEditTime(task.scheduledTime || '');
                                        }}
                                        className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        <Edit3 size={12} />
                                    </button>
                                    <div className="flex flex-col">
                                        <button onClick={() => moveTask(index, 'up')} disabled={index === 0} className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white disabled:opacity-0"><ChevronUp size={12} /></button>
                                        <button onClick={() => moveTask(index, 'down')} disabled={index === orderedTasks.length - 1} className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white disabled:opacity-0"><ChevronDown size={12} /></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
