import { apiClient } from './client';
import type { Challenge } from '../types/index';

export const challengeApi = {
    getChallenges: async (): Promise<Challenge[]> => {
        const res = await apiClient.get<Challenge[]>('/challenges');
        return res.data;
    },
    
    addChallenge: async (challenge: Challenge): Promise<Challenge> => {
        const res = await apiClient.post<Challenge>('/challenges', challenge);
        return res.data;
    },
    
    updateChallenge: async (id: string, challenge: Challenge): Promise<void> => {
        await apiClient.put(`/challenges/${id}`, challenge);
    },
    
    deleteChallenge: async (id: string): Promise<void> => {
        await apiClient.delete(`/challenges/${id}`);
    },

    resetData: async (): Promise<void> => {
        await apiClient.delete('/danger/reset');
    }
};
