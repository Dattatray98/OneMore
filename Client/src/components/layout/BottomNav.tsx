import React from 'react';
import { Home, Calendar, Clock, Target, Settings } from 'lucide-react';
import { useViewStore } from '../../store/useViewStore';

interface BottomNavProps {}

export const BottomNav: React.FC<BottomNavProps> = () => {
    const { currentView, setCurrentView: onViewChange } = useViewStore();
    const navItems = [
        { id: 'my-day', label: 'My Day', icon: Home },
        { id: 'pomodoro', label: 'Focus', icon: Clock },
        { id: 'disciplined', label: 'Protocol', icon: Target },
        { id: 'planned', label: 'Plan', icon: Calendar },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] px-1 pt-2 z-50">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id as any)}
                            className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors duration-200 ${isActive
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <item.icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-1' : 'scale-100'}`}
                            />
                            <span className={`text-[10px] tracking-tight transition-all duration-200 ${isActive ? 'font-bold translate-y-0 opacity-100' : 'font-medium translate-y-1 opacity-80'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
