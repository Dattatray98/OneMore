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
            setChallenges(Array.isArray(data) ? data : []);
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
