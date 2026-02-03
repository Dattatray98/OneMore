import { Home, Calendar, Star, Settings, LogOut, CheckSquare, Target } from 'lucide-react';

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
    return (
        <aside className="w-64 h-screen bg-slate-900/50 border-r border-white/5 flex flex-col fixed left-0 top-0 backdrop-blur-xl z-20">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <CheckSquare size={16} strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    TaskDaily
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {[
                    { icon: Home, label: 'My Day', id: 'my-day' },
                    { icon: Star, label: 'Important', id: 'important' },
                    { icon: Calendar, label: 'Planned', id: 'planned' },
                    { icon: Target, label: 'Disciplined', id: 'disciplined' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === item.id
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} className={currentView === item.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-white'} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                    <Settings size={20} className="text-slate-500" />
                    <span className="font-medium text-sm">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};
