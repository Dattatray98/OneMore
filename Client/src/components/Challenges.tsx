import { useState } from 'react';
import { Trophy, Target, Award, CalendarDays } from 'lucide-react';

export const Challenges = () => {
    const [challenges] = useState([
        {
            id: 1,
            title: "Early Bird",
            description: "Complete 5 tasks before 10 AM",
            progress: 3,
            total: 5,
            icon: CalendarDays,
            color: "from-amber-400 to-orange-500"
        },
        {
            id: 2,
            title: "Focus Master",
            description: "Maintain a 7-day streak without missing a daily goal",
            progress: 4,
            total: 7,
            icon: Target,
            color: "from-blue-400 to-indigo-500"
        },
        {
            id: 3,
            title: "Productivity King",
            description: "Complete 50 tasks in total",
            progress: 32,
            total: 50,
            icon: Award,
            color: "from-purple-400 to-pink-500"
        }
    ]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <challenge.icon size={80} />
                        </div>

                        <div className="p-6 relative z-10">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${challenge.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                                <challenge.icon size={24} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">{challenge.title}</h3>
                            <p className="text-sm text-slate-400 mb-6 h-10">{challenge.description}</p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <span>Progress</span>
                                    <span>{challenge.progress} / {challenge.total}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${challenge.color} transition-all duration-1000 ease-out`}
                                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/10 text-center relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-cyan-500/5 rotate-12 blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-cyan-500/30 mb-4 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]">
                        <Trophy size={32} className="text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Weekly Leaderboard</h3>
                    <p className="text-slate-400 max-w-md mb-6">Compete with friends and stay consistent to climb the ranks!</p>
                    <button className="px-6 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors">
                        View Standings
                    </button>
                </div>
            </div>
        </div>
    );
};
