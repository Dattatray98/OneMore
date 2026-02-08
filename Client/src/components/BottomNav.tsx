import React from 'react';
import { Home, Calendar, Clock, Target, Settings } from 'lucide-react';

interface BottomNavProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
    const navItems = [
        { id: 'my-day', label: 'My Day', icon: Home },
        { id: 'pomodoro', label: 'Focus', icon: Clock },
        { id: 'disciplined', label: 'Protocol', icon: Target },
        { id: 'planned', label: 'Plan', icon: Calendar },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-6 py-2 z-50 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group active:scale-95 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-b-full shadow-[0_2px_8px_rgba(6,182,212,0.6)] animate-fade-in" />
                            )}
                            <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-cyan-500/10 dark:bg-cyan-500/20' : ''}`}>
                                <item.icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}
                                />
                            </div>
                            <span className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 hidden'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
