import React from 'react';
import { Calendar, Trophy } from 'lucide-react';
import type { Challenge } from '../../../types';

export interface ProgressMapProps {
    challenge: Challenge;
    selectedDay: number | null;
    todayIndex: number;
    overallProgressPercent: number;
    getProgressStyle: (day: number) => string;
    onSelectDay: (day: number) => void;
}

export const ProgressMap: React.FC<ProgressMapProps> = ({
    challenge,
    selectedDay,
    todayIndex,
    overallProgressPercent,
    getProgressStyle,
    onSelectDay
}) => {
    return (
        <div className="order-1 md:order-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-3xl p-4 md:p-6 shadow-xl dark:shadow-none backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Calendar size={20} className="text-slate-400 dark:text-slate-500" />
                    Progress Map
                </h4>
                <div className="text-xs font-mono bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg text-slate-500 dark:text-slate-400">
                    {Math.round(overallProgressPercent)}% Complete
                </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 md:gap-3">
                {Array.from({ length: challenge.days }, (_, i) => i + 1).map((day) => {
                    const styleClass = getProgressStyle(day);
                    const isSelected = selectedDay === day;
                    const isCurrent = day === todayIndex;
                    return (
                        <div
                            key={day}
                            onClick={() => onSelectDay(day)}
                            className={`
                            group relative aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300  h-11
                            ${styleClass}
                            ${isSelected ? 'ring-2 ring-cyan-500 dark:ring-cyan-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-100 z-10 shadow-lg dark:shadow-cyan-500/20 shadow-cyan-500/10' : 'opacity-80 hover:opacity-100 hover:scale-105 active:scale-95'}
                            ${isCurrent && !isSelected ? 'ring-1 ring-cyan-600 dark:ring-cyan-500/50' : ''}
                        `}
                        >
                            <span className={`text-xs font-bold ${challenge.completedDays.includes(day) || (challenge.dailyProgress[day] && challenge.dailyProgress[day].filter(Boolean).length > 0) ? 'opacity-100' : 'opacity-40'}`}>
                                {day}
                            </span>
                            {isCurrent && (
                                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                            )}
                        </div>
                    );
                })}
            </div>

            {challenge.completedDays.length === challenge.days && (
                <div className="mt-8 p-6 bg-linear-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl flex items-center gap-6 animate-fade-in shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]">
                    <div className="p-4 bg-yellow-500 rounded-full text-black shadow-lg shadow-yellow-500/40">
                        <Trophy size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Legendary Status Achieved!</h3>
                        <p className="text-yellow-700 dark:text-yellow-200/80 font-medium">You have mastered this challenge. Time for the next level?</p>
                    </div>
                </div>
            )}
        </div>
    );
};
