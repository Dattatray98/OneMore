import { useState, useEffect } from 'react';
import { Menu, X, CheckSquare, Bell } from 'lucide-react';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled
                ? 'bg-slate-950/80 backdrop-blur-xl border-white/10 py-3 shadow-lg shadow-black/20'
                : 'bg-transparent border-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                        <CheckSquare size={20} strokeWidth={2.5} />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                        TaskDaily
                    </span>
                </div>

                {/* Desktop Links */}
                <div className={`hidden md:flex items-center gap-8 px-6 py-2 rounded-full transition-all duration-300 ${scrolled
                        ? 'bg-transparent border-transparent'
                        : 'bg-white/5 border border-white/5 backdrop-blur-sm'
                    }`}>
                    {['Dashboard', 'Focus Mode', 'Analytics', 'Settings'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full group-hover:left-0" />
                        </a>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors relative hover:bg-white/5 rounded-lg group">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-slate-950" />
                    </button>
                    <button className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all group cursor-pointer hover:shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-slate-950 ring-2 ring-transparent group-hover:ring-cyan-500/50 transition-all">
                            JD
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-white">John Doe</span>
                            <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">Pro Plan</span>
                        </div>
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-300 hover:text-white transition-colors p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="flex flex-col p-6 gap-2">
                    {['Dashboard', 'Focus Mode', 'Analytics', 'Settings'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-slate-400 hover:text-cyan-400 px-4 py-3 hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group"
                        >
                            {item}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
};
