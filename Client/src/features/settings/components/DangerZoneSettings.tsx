import React from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../../../api';

export const DangerZoneSettings: React.FC = () => {
    return (
        <section className="bg-red-500/5 border border-red-500/10 rounded-2xl md:rounded-3xl p-4 md:p-8 space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-red-400 flex items-center gap-2 md:gap-3">
                <Trash2 size={20} className="md:w-6 md:h-6" />
                Danger Zone
            </h2>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20 gap-4">
                <div>
                    <h3 className="text-red-900 dark:text-white font-bold text-sm md:text-base">Reset Application</h3>
                    <p className="text-xs md:text-sm text-red-700/60 dark:text-red-200/60">Permanently remove all tasks and data.</p>
                </div>
                <button
                    onClick={async () => {
                        if (confirm('Are you definitely sure? This will wipe everything.')) {
                            await api.resetData();
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="w-full md:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
                >
                    Reset App
                </button>
            </div>
        </section>
    );
};
