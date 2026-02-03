import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ArrowRight, CheckCircle2, Zap, Shield, Layout } from 'lucide-react';

export const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-cyan-950 font-sans">
            <Navbar />

            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-4 overflow-hidden">
                    <div className="container mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium mb-8 animate-fade-in-up">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            v2.0 is now live
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent max-w-4xl mx-auto leading-[1.1]">
                            Organize your work, <br />
                            <span className="text-white">unleash your potential.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                            The minimalist task manager built for modern professionals.
                            Focus on what matters with a beautifully designed, distraction-free interface.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <Link
                                to="/app"
                                className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2"
                            >
                                Get Started
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Abstract Grid Background */}
                    <div className="absolute bottom-0 left-0 w-full h-[50%] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_top,black,transparent)] pointer-events-none" />
                </section>

                {/* Feature Grid */}
                <section className="py-24 bg-slate-950/50 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
                            <p className="text-slate-400">Power-packed features in a simple package</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Zap, title: "Lightning Fast", desc: "Built with Vite and React for instant interactions and zero lag." },
                                { icon: Shield, title: "Private & Secure", desc: "Your data stays in your browser. No trackers, no ads, just focus." },
                                { icon: Layout, title: "Beautiful Design", desc: "A clean, glassmorphic interface that makes work feel like play." }
                            ].map((feature, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 group">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <feature.icon className="text-cyan-400" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Social Proof / Stats */}
                <section className="py-20 border-y border-white/5 bg-white/[0.02]">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center md:justify-around gap-12 text-center">
                        {[
                            { number: "10k+", label: "Active Users" },
                            { number: "500k+", label: "Tasks Completed" },
                            { number: "99.9%", label: "Uptime" }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent mb-2">{stat.number}</div>
                                <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/10 pointer-events-none" />
                    <div className="container mx-auto max-w-4xl relative">
                        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 p-12 md:p-20 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)]" />

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to boost your productivity?</h2>
                                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
                                    Join thousands of users who are getting more done, every single day.
                                    No credit card required.
                                </p>
                                <Link
                                    to="/app"
                                    className="inline-flex items-center gap-2 px-10 py-4 bg-cyan-500 text-black hover:bg-cyan-400 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)]"
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
