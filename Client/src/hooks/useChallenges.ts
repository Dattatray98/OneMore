import { useState, useCallback } from 'react';
import { api } from '../api';
import type { Challenge } from '../types';

export const useChallenges = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChallenges = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getChallenges();
            setChallenges(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch challenges');
        } finally {
            setLoading(false);
        }
    }, []);

    const addChallenge = useCallback(async (challenge: Challenge) => {
        try {
            const newChallenge = await api.addChallenge(challenge);
            setChallenges(prev => [...prev, newChallenge]);
            return newChallenge;
        } catch (err: any) {
            setError(err.message || 'Failed to add challenge');
            throw err;
        }
    }, []);

    const updateChallenge = useCallback(async (id: string, updates: Partial<Challenge>) => {
        try {
            // Optimistic update
            setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
            // Type casting because api expects full Challenge (mostly) or we need to ensure types match. 
            // In a real app, API should accept Partial<Challenge> or we fetch fresh. 
            // The current api signature says 'challenge: Challenge'. 
            // Let's assume for now we have the full object or backend handles partials loosely via PUT/PATCH logic in practice, 
            // OR we fix the api signature later. 
            // For safety here, we'll assume updates contains the full object as required by the current frontend logic usually.

            // Correction: The api.updateChallenge takes (id, Challenge). 
            // So we need the full object.

            const existing = challenges.find(c => c.id === id);
            if (!existing) return;
            const fullUpdated = { ...existing, ...updates };

            await api.updateChallenge(id, fullUpdated);
        } catch (err: any) {
            setError(err.message || 'Failed to update challenge');
            fetchChallenges();
        }
    }, [challenges, fetchChallenges]);

    const deleteChallenge = useCallback(async (id: string) => {
        try {
            setChallenges(prev => prev.filter(c => c.id !== id));
            await api.deleteChallenge(id);
        } catch (err: any) {
            setError(err.message || 'Failed to delete challenge');
            fetchChallenges();
        }
    }, [fetchChallenges]);

    return {
        challenges,
        loading,
        error,
        fetchChallenges,
        addChallenge,
        updateChallenge,
        deleteChallenge
    };
};
