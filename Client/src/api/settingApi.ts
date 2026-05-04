import { apiClient } from './client';

export const settingApi = {
    getSettings: async () => {
        const res = await apiClient.get('/settings');
        return res.data;
    },
    updateSettings: async (updates: any) => {
        const res = await apiClient.patch('/settings', updates);
        return res.data;
    }
};
