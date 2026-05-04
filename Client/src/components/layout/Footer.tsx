import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
                    <div className="max-w-md">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 dark:from-white to-slate-500 dark:to-slate-400 mb-4">
                            TaskDaily
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                            Master your day with a command center designed for precision, discipline, and focus.
                            Built for the modern high-performer.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300 hover:-translate-y-1 border border-transparent dark:border-white/5 shadow-sm"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} TaskDaily. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <span>Made with</span>
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span>by J.D</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
