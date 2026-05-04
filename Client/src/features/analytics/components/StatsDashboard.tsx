import React from 'react';
import { Trophy, BarChart3, TrendingUp } from 'lucide-react';

export interface ChallengeStats {
    completed: number;
    consistency: number;
    daysLeft: number;
}

interface StatsDashboardProps {
    stats: ChallengeStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
    return (
        <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-4 md:pb-0 snap-x hide-scrollbar">
            <div className="min-w-[160px] md:min-w-0 snap-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-1 md:mb-0">
                    <Trophy className="text-cyan-600 dark:text-cyan-400" size={20} />
                </div>
                <div>
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Completed</p>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{stats.completed} <span className="text-xs md:text-sm font-normal text-slate-500">Days</span></p>
                </div>
            </div>
            <div className="min-w-[160px] md:min-w-0 snap-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-1 md:mb-0">
                    <BarChart3 className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <div>
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Consistency</p>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{stats.consistency}% <span className="text-xs md:text-sm font-normal text-slate-500">Success</span></p>
                </div>
            </div>
            <div className="min-w-[160px] md:min-w-0 snap-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 shadow-sm dark:shadow-none">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-1 md:mb-0">
                    <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
                <div>
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Left to Win</p>
                    <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{stats.daysLeft} <span className="text-xs md:text-sm font-normal text-slate-500">Days</span></p>
                </div>
            </div>
        </div>
    );
};
