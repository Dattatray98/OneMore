import type { Task, Challenge } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
    // TASKS
    getTasks: async (): Promise<Task[]> => {
        const res = await fetch(`${API_URL}/tasks`);
        return res.json();
    },
    addTask: async (task: Task): Promise<Task> => {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        return res.json();
    },
    updateTask: async (id: string, updates: Partial<Task>): Promise<void> => {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
    },
    deleteTask: async (id: string): Promise<void> => {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
        });
    },

    // CHALLENGES
    getChallenges: async (): Promise<Challenge[]> => {
        const res = await fetch(`${API_URL}/challenges`);
        return res.json();
    },
    addChallenge: async (challenge: Challenge): Promise<Challenge> => {
        const res = await fetch(`${API_URL}/challenges`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(challenge),
        });
        return res.json();
    },
    updateChallenge: async (id: string, challenge: Challenge): Promise<void> => {
        await fetch(`${API_URL}/challenges/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(challenge),
        });
    },
    deleteChallenge: async (id: string): Promise<void> => {
        await fetch(`${API_URL}/challenges/${id}`, {
            method: 'DELETE',
        });
    },

    resetData: async (): Promise<void> => {
        await fetch(`${API_URL}/danger/reset`, {
            method: 'DELETE',
        });
    },

    // POMODORO
    getPomodoroStats: async (date: string): Promise<any> => {
        const res = await fetch(`${API_URL}/pomodoro/stats/${date}`);
        return res.json();
    },
    getAllPomodoroStats: async (): Promise<any[]> => {
        const res = await fetch(`${API_URL}/pomodoro/stats`);
        return res.json();
    },
    savePomodoroStats: async (date: string, data: any): Promise<void> => {
        await fetch(`${API_URL}/pomodoro/stats/${date}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }
};
