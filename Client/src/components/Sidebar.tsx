import { Home, Calendar, Clock, Settings, CheckSquare } from 'lucide-react';

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
    return (
        <aside className="w-64 h-screen bg-white/80 dark:bg-slate-900/50 border-r border-slate-200 dark:border-white/5 flex flex-col fixed left-0 top-0 backdrop-blur-xl z-20 transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-8 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                    <CheckSquare size={20} />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-600 to-blue-700 dark:from-white dark:to-slate-400 tracking-tight">
                    TaskDaily
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {[
                    { icon: Home, label: 'My Day', id: 'my-day' },
                    { icon: Clock, label: 'Pomodoro', id: 'pomodoro' },
                    { icon: Calendar, label: 'Planned', id: 'planned' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === item.id
                            ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] dark:shadow-none'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <item.icon size={20} className={currentView === item.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
                <button
                    onClick={() => onViewChange('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'settings'
                        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] dark:shadow-none'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    <Settings size={20} className={currentView === 'settings' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-500'} />
                    <span className="font-medium text-sm">Settings</span>
                </button>

            </div>
        </aside>
    );
};
