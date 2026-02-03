import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface TaskInputProps {
    onAdd: (text: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text.trim());
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mb-8 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative flex items-center bg-slate-900 rounded-xl overflow-hidden p-1">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What needs to be done today?"
                    className="w-full bg-transparent text-white placeholder-slate-500 px-6 py-4 text-lg outline-none"
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add</span>
                </button>
            </div>
        </form>
    );
};
