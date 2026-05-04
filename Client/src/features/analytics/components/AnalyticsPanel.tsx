import React from 'react';
import { TrendingUp } from 'lucide-react';

export interface TaskStat {
    name: string;
    count: number;
    color: string;
}

export interface AnalyticsPanelProps {
    overallProgressPercent: number;
    completedDaysCount: number;
    totalChallengeDays: number;
    selectedDay: number | null;
    selectedDayCompletedTasks: number;
    selectedDayTotalTasks: number;
    taskStats: TaskStat[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
    overallProgressPercent,
    completedDaysCount,
    totalChallengeDays,
    selectedDay,
    selectedDayCompletedTasks,
    selectedDayTotalTasks,
    taskStats
}) => {
    const selectedDayPercent = selectedDayTotalTasks > 0 ? (selectedDayCompletedTasks / selectedDayTotalTasks) * 100 : 0;
    return (
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x hide-scrollbar order-2 md:order-1">
            {/* 1. Full Challenge Progress (Circle) */}
            <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center shrink-0 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg dark:shadow-none backdrop-blur-md min-h-[220px]">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Challenge Progress</h4>
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r="40"
                            fill="transparent"
                            stroke="url(#gradient-cyan)"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - (overallProgressPercent / 100))}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(overallProgressPercent)}%</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Success</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 font-medium">{completedDaysCount} of {totalChallengeDays} Days Victorious</p>
            </div>

            {/* 2. Daily Protocol Progress (Circle) */}
            <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center shrink-0 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg dark:shadow-none backdrop-blur-md min-h-[220px]">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Day {selectedDay} Protocol</h4>
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {(() => {
                        return (
                            <>
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="transparent"
                                        stroke="url(#gradient-green)"
                                        strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 40}
                                        strokeDashoffset={2 * Math.PI * 40 * (1 - (selectedDayPercent / 100))}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#34d399" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(selectedDayPercent)}%</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Tasks</span>
                                </div>
                            </>
                        );
                    })()}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                    {selectedDayCompletedTasks} / {selectedDayTotalTasks} Completed
                </p>
            </div>

            {/* 3. Habit Leaderboard (Data representation) */}
            <div className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center shrink-0 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-4 md:p-6 flex flex-col shadow-lg dark:shadow-none backdrop-blur-md min-h-[220px]">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Habit Leaderboard</span>
                    <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-500" />
                </h4>
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                    {taskStats.length > 0 ? (
                        taskStats.slice(0, 4).map((stat, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-900 dark:text-slate-200 font-bold truncate max-w-[120px]">{stat.name}</span>
                                    <span className="text-slate-500 font-mono">{stat.count} Wins</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${(stat.count / Math.max(...taskStats.map(s => s.count), 1)) * 100}%`,
                                            backgroundColor: stat.color
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-xs">
                            No data yet
                        </div>
                    )}
                </div>
                {taskStats.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Top: <span className="text-slate-900 dark:text-white font-bold">{taskStats[0].name}</span></span>
                    </div>
                )}
            </div>
        </div>
    );
};
