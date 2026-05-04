import React from 'react';
import { ChevronLeft, X, Sun, Shield, CheckCircle2 } from 'lucide-react';
import type { Task } from '../../../types';

export interface ImportTasksModalProps {
    importModal: 'source-select' | 'my-day' | 'protocol' | null;
    activeChallengeTitle?: string;
    importCandidates: (Task & { isProtocol?: boolean })[];
    selectedImportIds: Set<string>;
    setImportModal: (val: 'source-select' | 'my-day' | 'protocol' | null) => void;
    handleSelectSource: (source: 'my-day' | 'protocol') => void;
    toggleImportSelection: (id: string) => void;
    confirmImport: () => void;
}

export const ImportTasksModal: React.FC<ImportTasksModalProps> = ({
    importModal,
    activeChallengeTitle,
    importCandidates,
    selectedImportIds,
    setImportModal,
    handleSelectSource,
    toggleImportSelection,
    confirmImport
}) => {
    if (!importModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in text-left">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {(importModal === 'my-day' || importModal === 'protocol') && (
                            <button
                                onClick={() => setImportModal('source-select')}
                                className="p-1 -ml-2 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {importModal === 'source-select' && 'Select Source'}
                            {importModal === 'my-day' && 'My Day Tasks'}
                            {importModal === 'protocol' && 'Protocol Tasks'}
                        </h3>
                    </div>
                    <button onClick={() => setImportModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {importModal === 'source-select' ? (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        <button
                            onClick={() => handleSelectSource('my-day')}
                            className="w-full p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/50 rounded-2xl flex items-center gap-4 transition-all group text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Sun size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">My Day Schedule</h4>
                                <p className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">Import from today's plan</p>
                            </div>
                        </button>

                        {activeChallengeTitle && (
                            <button
                                onClick={() => handleSelectSource('protocol')}
                                className="w-full p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-cyan-500/50 rounded-2xl flex items-center gap-4 transition-all group text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-500 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeChallengeTitle}</h4>
                                    <p className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">Import from active protocol</p>
                                </div>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                            {importCandidates.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-xs">
                                    No tasks available to import from this source.
                                </div>
                            ) : (
                                importCandidates.map(task => (
                                    <div
                                        key={task.id}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${selectedImportIds.has(task.id)
                                            ? 'bg-cyan-500/10 border-cyan-500/50'
                                            : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                        onClick={() => toggleImportSelection(task.id)}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedImportIds.has(task.id)
                                            ? 'bg-cyan-500 border-cyan-500'
                                            : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/20'}`}
                                        >
                                            {selectedImportIds.has(task.id) && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${selectedImportIds.has(task.id) ? 'text-cyan-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{task.text}</p>
                                            {task.scheduledTime && (
                                                <span className="text-[10px] font-mono text-slate-500">{task.scheduledTime}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setImportModal(null)}
                                className="flex-1 py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200 dark:border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmImport}
                                disabled={selectedImportIds.size === 0}
                                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
                            >
                                Import ({selectedImportIds.size})
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
