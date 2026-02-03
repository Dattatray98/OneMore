import React from 'react';
import type { Task } from '../types';
import { Check, Trash2 } from 'lucide-react';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
    return (
        <div
            className={`group flex items-center justify-between p-4 mb-3 rounded-xl backdrop-blur-md border transition-all duration-300 ${task.completed
                ? 'bg-white/5 border-white/5 opacity-50'
                : 'bg-white/10 border-white/10 hover:border-cyan-500/30 hover:bg-white/15 hover:shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]'
                }`}
        >
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => onToggle(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed
                        ? 'bg-cyan-500 border-cyan-500 text-black'
                        : 'border-slate-500 group-hover:border-cyan-400'
                        }`}
                >
                    {task.completed && <Check size={14} strokeWidth={3} />}
                </button>
                <span
                    className={`text-lg transition-all duration-300 ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                >
                    {task.text}
                </span>
            </div>

            <button
                onClick={() => onDelete(task.id)}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-400/10"
                aria-label="Delete task"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};
