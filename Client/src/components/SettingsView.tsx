import React, { useState } from 'react';
import { Moon, Sun, Bell, Trash2, Monitor } from 'lucide-react';
import { api } from '../api';

interface SettingsViewProps {
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your preferences and application data.</p>
            </header>

            <div className="grid gap-6">
                {/* Appearance */}
                <section className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-8 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Monitor className="text-cyan-600 dark:text-cyan-400" size={24} />
                        Appearance
                    </h2>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Theme</label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'dark', label: 'Dark Mode', icon: Moon },
                                { id: 'light', label: 'Light Mode', icon: Sun },
                                { id: 'system', label: 'System', icon: Monitor },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setTheme(item.id as any)}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${theme === item.id
                                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-white shadow-[0_0_20px_rgba(6,182,212,0.1)] dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <item.icon size={24} />
                                    <span className="text-sm font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Enable sound effects and alerts</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setNotifications(!notifications)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${notifications ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-6">
                    <h2 className="text-xl font-bold text-red-400 flex items-center gap-3">
                        <Trash2 size={24} />
                        Danger Zone
                    </h2>

                    <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                        <div>
                            <h3 className="text-red-900 dark:text-white font-bold">Clear All Data</h3>
                            <p className="text-sm text-red-700/60 dark:text-red-200/60">Permanently remove all tasks, stats, and settings.</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Are you definitely sure? This will wipe everything.')) {
                                    await api.resetData();
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
                        >
                            Reset App
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
