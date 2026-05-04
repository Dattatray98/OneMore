import { apiClient } from './client';

export const aiApi = {
    getInsights: async () => {
        const res = await apiClient.get('/ai/insights');
        return res.data;
    }
};
