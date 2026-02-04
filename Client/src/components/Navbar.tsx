import { useState, useEffect } from 'react';
import { Menu, X, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200 dark:border-white/10 py-3 shadow-lg dark:shadow-black/20 shadow-slate-200/50'
                : 'bg-transparent border-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                        <CheckSquare size={20} strokeWidth={2.5} />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 dark:from-white via-slate-700 dark:via-slate-200 to-slate-500 dark:to-slate-400 tracking-tight">
                        OneMore
                    </span>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/app"
                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                    >
                        Open App
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-2 cursor-pointer"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="flex flex-col p-6 gap-2">
                    <Link
                        to="/app"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-xl font-bold transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Launch App
                        <span>→</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
