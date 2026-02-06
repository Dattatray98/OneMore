import axios from 'axios';
import type { Task, Challenge } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api';

let authToken: string | null = null;

export const setApiToken = (token: string | null) => {
    authToken = token;
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to add Token
axiosInstance.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor for Error Handling (Optional but good)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can handle global 401s here if needed
        return Promise.reject(error.response?.data?.error || error.message || 'API Error');
    }
);

export const api = {
    // TASKS
    getTasks: async (): Promise<Task[]> => {
        const res = await axiosInstance.get('/tasks');
        return res.data;
    },
    addTask: async (task: Task): Promise<Task> => {
        const res = await axiosInstance.post('/tasks', task);
        return res.data;
    },
    updateTask: async (id: string, updates: Partial<Task>): Promise<void> => {
        await axiosInstance.put(`/tasks/${id}`, updates);
    },
    deleteTask: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/tasks/${id}`);
    },

    // CHALLENGES
    getChallenges: async (): Promise<Challenge[]> => {
        const res = await axiosInstance.get('/challenges');
        return res.data;
    },
    addChallenge: async (challenge: Challenge): Promise<Challenge> => {
        const res = await axiosInstance.post('/challenges', challenge);
        return res.data;
    },
    updateChallenge: async (id: string, challenge: Challenge): Promise<void> => {
        await axiosInstance.put(`/challenges/${id}`, challenge);
    },
    deleteChallenge: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/challenges/${id}`);
    },

    resetData: async (): Promise<void> => {
        await axiosInstance.delete('/danger/reset');
    },

    // POMODORO
    getPomodoroStats: async (date: string): Promise<any> => {
        const res = await axiosInstance.get(`/pomodoro/stats/${date}`);
        return res.data;
    },
    getAllPomodoroStats: async (): Promise<any[]> => {
        const res = await axiosInstance.get('/pomodoro/stats');
        return res.data;
    },
    savePomodoroStats: async (date: string, data: any): Promise<void> => {
        await axiosInstance.post(`/pomodoro/stats/${date}`, data);
    },
    clearPomodoroHistory: async (): Promise<void> => {
        await axiosInstance.delete('/pomodoro/stats');
    }
};
