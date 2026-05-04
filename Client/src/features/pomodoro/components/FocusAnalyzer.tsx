import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { format, subDays } from 'date-fns';

export interface FocusAnalyzerProps {
    dailyStats: { workSecs: number, breakSecs: number };
    onClear: () => void;
    history: any[];
    sessionCount?: number;
}

export const FocusAnalyzer: React.FC<FocusAnalyzerProps> = ({ dailyStats, onClear, history, sessionCount }) => {
    const today = new Date();
    const [hoveredData, setHoveredData] = useState<{ x: number, y: number, day: string, hours: string, sessions: number } | null>(null);

    const sessionStats: Record<string, number> = {};
    const timeStatsRecord: Record<string, any> = {};

    const safeHistory = Array.isArray(history) ? history : [];
    safeHistory.forEach(h => {
        const stats = timeStatsRecord[h.date] || { workSecs: 0, breakSecs: 0 };
        sessionStats[h.date] = (sessionStats[h.date] || 0) + h.sessionCount;
        timeStatsRecord[h.date] = {
            workSecs: stats.workSecs + h.workSecs,
            breakSecs: stats.breakSecs + h.breakSecs
        };
    });

    const data = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(today, 6 - i);
        const dayStr = format(d, 'yyyy-MM-dd');
        const isToday = format(today, 'yyyy-MM-dd') === dayStr;

        let workSecs = 0;
        let sessions = 0;

        if (isToday) {
            workSecs = dailyStats.workSecs;
            sessions = sessionCount ?? (sessionStats[dayStr] || 0);
        } else {
            const timeStats = timeStatsRecord[dayStr] || { workSecs: 0 };
            workSecs = timeStats.workSecs !== undefined ? timeStats.workSecs : (timeStats.workMins || 0) * 60;
            sessions = sessionStats[dayStr] || 0;
        }

        const hours = workSecs / 3600;
        return {
            day: format(d, 'EEE'),
            fullDate: format(d, 'MMM d'),
            value: Number(hours.toFixed(2)),
            sessions: sessions,
            formattedDuration: formatDuration(workSecs)
        };
    });

    const maxVal = Math.max(...data.map(d => d.value), 4); // Scale up to at least 4 hours context

    const width = 200;
    const height = 40;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const normalizedVal = d.value / maxVal;
        const y = height - (normalizedVal * height);
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M 0,${height} ${points} L ${width},${height} Z`;

    const totalSecs = data.reduce((acc, curr) => acc + (curr.value * 3600), 0);
    const totalSessions = data.reduce((acc, curr) => acc + curr.sessions, 0);

    // Helper inside component to avoid hoist issues (or duplicating logic if formatDuration is outside)
    function formatDuration(totalSeconds: number) {
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${hours}h ${mins}m ${secs}s`;
    }

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 shadow-xl relative overflow-visible">
            <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Focus Analyzer (7 Days)</span>
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{formatDuration(totalSecs)}</span>
                        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{totalSessions} Sessions</span>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to clear all focus history? This cannot be undone.')) {
                                onClear();
                            }
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Reset History"
                    >
                        <RotateCcw size={12} />
                    </button>
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">Last 7 Days</span>
                </div>
            </div>

            {/* Graph Container */}
            <div className="h-16 w-full relative" onMouseLeave={() => setHoveredData(null)}>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
                    {/* Grid Lines */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1={0} x2={width} y2={0} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#lineGradient)" />

                    {/* Line */}
                    <path d={`M ${points}`} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

                    {/* Points */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * width;
                        const normalizedVal = d.value / maxVal;
                        const y = height - (normalizedVal * height);
                        return (
                            <g key={i}>
                                {/* Invisible hit target */}
                                <circle
                                    cx={x} cy={y} r="8" fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredData({ x, y, day: d.fullDate, hours: d.formattedDuration, sessions: d.sessions })}
                                />
                                {d.value > 0 && <circle cx={x} cy={y} r="2" className="fill-slate-900 dark:fill-white pointer-events-none" />}
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                {hoveredData && (
                    <div
                        className="absolute bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 shadow-xl z-50 pointer-events-none animate-fade-in"
                        style={{
                            left: `${(hoveredData.x / width) * 100}%`,
                            bottom: `${((height - hoveredData.y) / height) * 100}%`,
                            transform: 'translate(-50%, -10px)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">{hoveredData.day}</div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{hoveredData.hours}</div>
                        <div className="text-[10px] text-cyan-600 dark:text-cyan-400">{hoveredData.sessions} Sessions</div>
                    </div>
                )}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2">
                {data.map((d, i) => (
                    <span key={i} className="text-[8px] font-bold text-slate-600 uppercase w-4 text-center">{d.day.charAt(0)}</span>
                ))}
            </div>
            {/* Hours Summary */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Focus</span>
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                        {formatDuration(dailyStats.workSecs)}
                    </span>
                </div>
                <div className="text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Break</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatDuration(dailyStats.breakSecs)}
                    </span>
                </div>
                <div className="text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Total</span>
                    <span className="text-sm font-bold text-slate-950 dark:text-white">
                        {formatDuration(dailyStats.workSecs + dailyStats.breakSecs)}
                    </span>
                </div>
            </div>
        </div>
    );
};
