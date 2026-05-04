import { apiClient } from './client';

export const pomodoroApi = {
    getStats: async (date: string): Promise<any> => {
        const res = await apiClient.get(`/pomodoro/stats/${date}`);
        return res.data;
    },
    
    getAllStats: async (): Promise<any[]> => {
        const res = await apiClient.get('/pomodoro/stats');
        return res.data;
    },
    
    saveStats: async (date: string, data: any): Promise<void> => {
        await apiClient.post(`/pomodoro/stats/${date}`, data);
    },
    
    clearHistory: async (): Promise<void> => {
        await apiClient.delete('/pomodoro/stats');
    }
};
