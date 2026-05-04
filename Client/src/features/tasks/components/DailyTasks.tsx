import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Challenge } from '../../../types';

interface DailyTasksProps {
    challenge: Challenge;
    selectedDay: number;
    todayIndex: number;
    isEditable: boolean;
    completedCount: number;
    totalCount: number;
    onToggleTask: (day: number, taskIndex: number) => void;
    onNavigateToPlanner?: (filter: 'normal' | 'disciplined', view: 'week' | 'day') => void;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({
    challenge,
    selectedDay,
    todayIndex,
    isEditable,
    completedCount,
    totalCount,
    onToggleTask,
    onNavigateToPlanner
}) => {
    return (
        <div className={`bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl p-4 md:p-6 shadow-xl dark:shadow-none h-full flex flex-col relative overflow-hidden group transition-all duration-300 ${!isEditable ? 'opacity-90 grayscale-[0.3]' : ''}`}>
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-6">
                <div>
                    <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">
                        {isEditable ? 'Active Protocol' : selectedDay < todayIndex ? 'Past Protocol' : 'Future Protocol'}
                    </h4>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Day {selectedDay}
                        {challenge.completedDays.includes(selectedDay) && (
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20 font-medium">Completed</span>
                        )}
                        {!isEditable && (
                            <span className="bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-600/30 font-medium flex items-center gap-1">
                                <Clock size={10} />
                                {selectedDay < todayIndex ? 'Archived' : 'Locked'}
                            </span>
                        )}
                    </h3>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {completedCount}
                        <span className="text-lg text-slate-400 dark:text-slate-500 font-medium">/{totalCount}</span>
                    </div>
                    {onNavigateToPlanner && (
                        <button
                            onClick={() => onNavigateToPlanner('disciplined', 'day')}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400/70 hover:text-cyan-700 dark:hover:text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 dark:border-cyan-400/20 px-2 py-1 rounded-lg transition-all cursor-pointer"
                        >
                            <Calendar size={12} />
                            View in Planner
                        </button>
                    )}

                </div>
            </div>

            {challenge.dailyRoutine.length > 0 ? (
                <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto max-h-[280px] md:max-h-[400px] pr-2 custom-scrollbar">
                    {challenge.dailyRoutine.map((task, idx) => {
                        const addedOn = task.addedOnDay || 1;
                        const removedOn = task.removedOnDay || Infinity;
                        const isVisible = selectedDay >= addedOn && selectedDay < removedOn;

                        if (!isVisible) return null;

                        const isDone = challenge.dailyProgress[selectedDay]?.[idx] || false;
                        return (
                            <div
                                key={task.id}
                                onClick={() => isEditable && onToggleTask(selectedDay, idx)}
                                className={`relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 transition-all duration-300 group/item ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                                    } ${isDone
                                        ? 'bg-cyan-500/10 border-cyan-500/30 dark:shadow-[0_4px_20px_-10px_rgba(34,211,238,0.4)] shadow-sm'
                                        : 'bg-white dark:bg-white/2 border-slate-100 dark:border-transparent ' + (isEditable ? 'hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md' : '')
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 border-2 ${isDone ? 'bg-cyan-500 border-cyan-500 scale-110' : 'bg-transparent border-slate-300 dark:border-slate-600 ' + (isEditable ? 'group-hover/item:border-slate-400' : '')
                                    }`}>
                                    {isDone && <CheckCircle2 size={12} className="text-white dark:text-black stroke-[3px]" />}
                                </div>
                                <div className="flex-1">
                                    <span className={`text-sm font-bold transition-colors block ${isDone ? 'text-slate-900 dark:text-white line-through decoration-cyan-500/50 decoration-2' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {task.text}
                                    </span>
                                    {task.time && (
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {format(new Date(`2000-01-01T${task.time}`), 'h:mm a')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 italic pb-4">
                    <p>No routine tasks defined.</p>
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                <p className="text-xs text-center text-slate-500">
                    {isEditable
                        ? "Complete all tasks to mark this day as victorious."
                        : "This day's protocol is sealed. Focus on today."
                    }
                </p>
            </div>
        </div>
    );
};
