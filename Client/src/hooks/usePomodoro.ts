import { useState, useCallback, useEffect } from 'react';
import { api } from '../api';

export const usePomodoro = (todayStr: string) => {
    const [dailyStats, setDailyStats] = useState({ workSecs: 0, breakSecs: 0 });
    const [sessionCount, setSessionCount] = useState(0);
    const [sequence, setSequence] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [stats, allHistory] = await Promise.all([
                    api.getPomodoroStats(todayStr),
                    api.getAllPomodoroStats()
                ]);

                setDailyStats({
                    workSecs: stats.workSecs || 0,
                    breakSecs: stats.breakSecs || 0
                });
                setSessionCount(stats.sessionCount || 0);
                setSequence(stats.sequence || []);
                setHistory(allHistory);
            } catch (error) {
                console.error("Failed to load pomodoro stats", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [todayStr]);

    const saveStats = useCallback(async (newStats: { workSecs: number, breakSecs: number }, newSessionCount: number, newSequence: any[]) => {
        // Optimistic UI Update done by caller usually, but we sync state here if needed.
        // For Pomodoro which is high-frequency, usually we just push to API.
        setDailyStats(newStats);
        setSessionCount(newSessionCount);
        setSequence(newSequence);

        await api.savePomodoroStats(todayStr, {
            ...newStats,
            sessionCount: newSessionCount,
            sequence: newSequence
        });
    }, [todayStr]);

    const clearHistory = useCallback(async () => {
        await api.clearPomodoroHistory();
        setDailyStats({ workSecs: 0, breakSecs: 0 });
        setSessionCount(0);
        setHistory([]);
        setSequence([]);
    }, []);

    return {
        dailyStats,
        sessionCount,
        sequence,
        history,
        loading,
        saveStats,
        clearHistory,
        setDailyStats,
        setSessionCount,
        setSequence,
        setHistory
    };
};
