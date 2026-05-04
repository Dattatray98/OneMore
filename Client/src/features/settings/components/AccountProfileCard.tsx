import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export const AccountProfileCard: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) return null;

    return (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-cyan-500 to-blue-600 opacity-10 dark:opacity-20" />

            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl bg-cyan-500 flex items-center justify-center text-white font-black text-3xl mx-auto">
                    {user.email?.[0].toUpperCase() || 'U'}
                </div>
            </div>

            <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.email?.split('@')[0]}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
            </div>

            <div className="flex items-center gap-3 pt-4 w-full md:w-auto">
                <button
                    onClick={logout}
                    className="flex-1 md:flex-none px-10 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-black rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/5 active:scale-95"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </section>
    );
};
