import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';

interface TaskInputProps {
    onAdd: (text: string) => void;
    onAdvancedAdd?: (text: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd, onAdvancedAdd }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text.trim());
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mb-6 md:mb-8 group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-10 dark:opacity-30 group-hover:opacity-20 dark:group-hover:opacity-60 transition duration-500" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden p-1 shadow-xl dark:shadow-none">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What needs to be done today?"
                    className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 md:px-6 md:py-4 text-base md:text-lg outline-none"
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="px-4 py-3 md:px-6 md:py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add</span>
                </button>
                {onAdvancedAdd && (
                    <button
                        type="button"
                        onClick={() => onAdvancedAdd(text)}
                        className="px-3 py-3 md:px-4 md:py-3 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors border-l border-slate-100 dark:border-white/5 cursor-pointer"
                        title="Set time and date"
                    >
                        <Calendar size={20} />
                    </button>
                )}
            </div>
        </form>
    );
};
