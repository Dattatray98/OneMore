import { apiClient } from './client';

export const activityApi = {
    getActivities: async (filters: any = {}) => {
        const res = await apiClient.get('/activity', { params: filters });
        return res.data;
    }
};
