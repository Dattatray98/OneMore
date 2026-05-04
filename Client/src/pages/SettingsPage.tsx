import React, { useState } from 'react';
import { Moon, Sun, Bell, Monitor, Cloud, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AccountProfileCard } from '../features/settings/components/AccountProfileCard';
import { DangerZoneSettings } from '../features/settings/components/DangerZoneSettings';

interface SettingsViewProps {
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const SettingsPage: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
    const [notifications, setNotifications] = useState(true);
    const [autoSync, setAutoSync] = useState(true);
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in p-4 md:p-8 pb-24 md:pb-8">


            <div className="grid gap-6">
                {/* Account Settings */}
                {/* Account Profile Card */}
                <AccountProfileCard />

                {/* Appearance */}
                <section className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 space-y-4 md:space-y-6">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
                        <Monitor className="text-cyan-600 dark:text-cyan-400" size={20} />
                        Appearance
                    </h2>

                    <div className="space-y-3 md:space-y-4">
                        <label className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Theme</label>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            {[
                                { id: 'dark', label: 'Dark', icon: Moon },
                                { id: 'light', label: 'Light', icon: Sun },
                                { id: 'system', label: 'System', icon: Monitor },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setTheme(item.id as any)}
                                    className={`flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border transition-all ${theme === item.id
                                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-white shadow-[0_0_20px_rgba(6,182,212,0.1)] dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <item.icon size={20} className="md:w-6 md:h-6" />
                                    <span className="text-xs md:text-sm font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>



                {/* Notifications */}
                <section className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                            <Bell size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Enable sound effects</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setNotifications(!notifications)}
                        className={`shrink-0 w-12 h-7 md:w-14 md:h-8 rounded-full p-1 transition-colors ${notifications ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transition-transform ${notifications ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </section>

                {/* Data & Sync */}
                <section className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 space-y-4 md:space-y-6">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
                        <Cloud className="text-cyan-600 dark:text-cyan-400" size={20} />
                        Data & Sync
                    </h2>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <RefreshCw size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Auto-Sync</h3>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Backup data to cloud</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoSync(!autoSync)}
                            className={`shrink-0 w-12 h-7 md:w-14 md:h-8 rounded-full p-1 transition-colors ${autoSync ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transition-transform ${autoSync ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Last synced: Just now</p>
                        </div>
                        <button className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                            Sync Now
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <DangerZoneSettings />
            </div>
        </div>
    );
};
