import React from 'react';
import { Calendar, Clock, Target, Settings, Zap } from 'lucide-react';
import { format } from 'date-fns';
import type { Challenge } from '../../../types';

interface ChallengeHeaderProps {
    challenge: Challenge;
    onStartEditing: () => void;
    onResetChallenge: () => void;
    onNavigateToPomodoro?: () => void;
}

export const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
    challenge,
    onStartEditing,
    onResetChallenge,
    onNavigateToPomodoro,
}) => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/10 p-4 md:p-8 shadow-xl dark:shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{challenge.title}</h2>
                        {challenge.description && (
                            <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg leading-relaxed">{challenge.description}</p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
                            <Calendar size={14} className="text-cyan-600 dark:text-cyan-400" />
                            <span>Started {format(new Date(challenge.startDate), 'MMM do')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
                            <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                            <span>Refreshes {challenge.refreshTime}</span>
                        </div>
                        {onNavigateToPomodoro && (
                            <button
                                onClick={onNavigateToPomodoro}
                                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-full border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                                <Target size={14} />
                                <span>Start Focus</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onStartEditing}
                        className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none cursor-pointer"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={onResetChallenge}
                        className="p-2.5 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-xl text-red-500/60 dark:text-red-400/60 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-red-200 dark:border-red-500/5 shadow-sm dark:shadow-none cursor-pointer"
                        title="Reset Progress"
                    >
                        <Zap size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
