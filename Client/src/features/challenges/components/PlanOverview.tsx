import React from 'react';
import { Target, Plus, ChevronRight } from 'lucide-react';
import type { Challenge } from '../../../types';

export interface PlanOverviewProps {
    challenges: Challenge[];
    setIsChallengeModalOpen: (open: boolean) => void;
    onSelectChallenge: (id: string) => void;
    onViewChange: (view: 'my-day' | 'important' | 'planned' | 'disciplined' | 'notes') => void;
}

export const PlanOverview: React.FC<PlanOverviewProps> = ({
    challenges,
    setIsChallengeModalOpen,
    onSelectChallenge,
    onViewChange
}) => {
    return (
        <div className="space-y-4">
            {/* List Format: Create New Challenge */}
            <div
                onClick={() => setIsChallengeModalOpen(true)}
                className="group bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-cyan-500/40 transition-all cursor-pointer"
            >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="text-cyan-600 dark:text-cyan-400" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Initiate New Protocol</h3>
                    <p className="text-slate-500 text-xs">Forge new habits and master your discipline.</p>
                </div>
            </div>

            {/* Existing Challenges List */}
            <div className="flex flex-col gap-3">
                {challenges.map((c) => {
                    const progress = Math.round((c.completedDays.length / c.days) * 100);
                    return (
                        <div
                            key={c.id}
                            className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl dark:shadow-none hover:border-cyan-500/30 transition-all flex items-center gap-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                <Target className="text-cyan-600 dark:text-cyan-400" size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{c.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                                    <span>{c.days} Days Total</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <span className="text-cyan-600 dark:text-cyan-400">{c.completedDays.length} Done</span>
                                </div>
                            </div>

                            <div className="hidden md:block w-64 space-y-2">
                                <div className="flex justify-between text-[10px] font-bold font-mono tracking-tighter">
                                    <span className="text-slate-500 dark:text-slate-400 uppercase">Success Rate</span>
                                    <span className="text-cyan-600 dark:text-cyan-400">{progress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    onSelectChallenge(c.id);
                                    onViewChange('disciplined');
                                }}
                                className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-cyan-600 hover:text-white text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-slate-200 dark:border-transparent"
                            >
                                View
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
