import type { Task, Challenge } from './types';

// Mock API that uses localStorage for persistence
export const api = {
    // TASKS
    getTasks: async (): Promise<Task[]> => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    },
    addTask: async (task: Task): Promise<Task> => {
        const tasks = await api.getTasks();
        const updated = [task, ...tasks];
        localStorage.setItem('tasks', JSON.stringify(updated));
        return task;
    },
    updateTask: async (id: string, updates: Partial<Task>): Promise<void> => {
        const tasks = await api.getTasks();
        const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        localStorage.setItem('tasks', JSON.stringify(updated));
    },
    deleteTask: async (id: string): Promise<void> => {
        const tasks = await api.getTasks();
        const updated = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks', JSON.stringify(updated));
    },

    // CHALLENGES
    getChallenges: async (): Promise<Challenge[]> => {
        const saved = localStorage.getItem('one_more_challenges');
        return saved ? JSON.parse(saved) : [];
    },
    addChallenge: async (challenge: Challenge): Promise<Challenge> => {
        const challenges = await api.getChallenges();
        const updated = [...challenges, challenge];
        localStorage.setItem('one_more_challenges', JSON.stringify(updated));
        return challenge;
    },
    updateChallenge: async (id: string, challenge: Challenge): Promise<void> => {
        const challenges = await api.getChallenges();
        const updated = challenges.map(c => c.id === id ? challenge : c);
        localStorage.setItem('one_more_challenges', JSON.stringify(updated));
    },
    deleteChallenge: async (id: string): Promise<void> => {
        const challenges = await api.getChallenges();
        const updated = challenges.filter(c => c.id !== id);
        localStorage.setItem('one_more_challenges', JSON.stringify(updated));
    },

    resetData: async (): Promise<void> => {
        localStorage.removeItem('tasks');
        localStorage.removeItem('one_more_challenges');
        localStorage.removeItem('pomodoro_stats');
    },

    // POMODORO
    getPomodoroStats: async (date: string): Promise<any> => {
        const stats = await api.getAllPomodoroStats();
        const found = stats.find((s: any) => s.date === date);
        return found || { workSecs: 0, breakSecs: 0, sessionCount: 0, sequence: [] };
    },
    getAllPomodoroStats: async (): Promise<any[]> => {
        const saved = localStorage.getItem('pomodoro_stats');
        return saved ? JSON.parse(saved) : [];
    },
    savePomodoroStats: async (date: string, data: any): Promise<void> => {
        const stats = await api.getAllPomodoroStats();
        const index = stats.findIndex((s: any) => s.date === date);
        const entry = { ...data, date };

        if (index > -1) {
            stats[index] = entry;
        } else {
            stats.push(entry);
        }
        localStorage.setItem('pomodoro_stats', JSON.stringify(stats));
    }
};
