import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowRight, CheckCircle2, Zap, Shield, Layout } from 'lucide-react';

export const Landing = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-cyan-500 selection:text-cyan-950 font-sans transition-colors duration-300">
            <Navbar />

            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-4 overflow-hidden">
                    <div className="container mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 text-sm font-bold mb-8 animate-fade-in-up">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            v2.0 is now live
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-linear-to-b from-slate-900 dark:from-white via-slate-800 dark:via-white to-slate-500 dark:to-slate-400 max-w-4xl mx-auto leading-[1.1]">
                            Master your schedule. <br />
                            <span className="text-slate-900 dark:text-white">Forge your discipline.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            The ultimate command center for high-performers. Sequence your tasks,
                            launch discipline protocols, and analyze your focus with precision.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <Link
                                to="/app"
                                className="group relative px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-full font-black text-lg transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-2 shadow-lg"
                            >
                                Launch Command Center
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Abstract Grid Background */}
                    <div className="absolute bottom-0 left-0 w-full h-[50%] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[linear-gradient(to_top,black,transparent)] pointer-events-none opacity-20 dark:opacity-100" />
                </section>

                {/* Feature Grid */}
                <section className="py-24 bg-slate-50 dark:bg-slate-950/50 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">Everything you need</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Power-packed features in a simple package</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Shield, title: "Forge Protocols", desc: "Design multi-day discipline rituals with automated resets and success velocity tracking." },
                                { icon: Zap, title: "Deep Work Engine", desc: "Integrated Pomodoro timer with task sequencing and real-time focus analytics." },
                                { icon: Layout, title: "Smart Planning", desc: "Keep it simple with 'My Day' or plan your entire month with future-proof scheduling." },
                                { icon: CheckCircle2, title: "Focus Analyzer", desc: "Track your evolution with 7-day visualization heatmaps and productivity stats." }
                            ].map((feature, i) => (
                                <div key={i} className="p-8 rounded-4xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-500 group shadow-sm hover:shadow-xl flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <feature.icon className="text-cyan-600 dark:text-cyan-400" size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>



                {/* CTA Section */}
                <section className="py-32 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-cyan-500/10 pointer-events-none" />
                    <div className="container mx-auto max-w-4xl relative">
                        <div className="rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_70%)]" />

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">Ready to boost your productivity?</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto font-medium">
                                    Join thousands of users who are getting more done, every single day.
                                    No credit card required.
                                </p>
                                <Link
                                    to="/app"
                                    className="inline-flex items-center gap-2 px-10 py-4 bg-cyan-600 dark:bg-cyan-500 text-white dark:text-black hover:bg-cyan-500 dark:hover:bg-cyan-400 rounded-full font-black text-lg transition-all hover:shadow-[0_0_40px_-10px_rgba(8,145,178,0.5)] active:scale-95"
                                >
                                    <CheckCircle2 size={20} />
                                    Start Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
