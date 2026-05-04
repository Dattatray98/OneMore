import { useState, useCallback } from 'react';
import { useChallengeStore } from '../store/useChallengeStore';
import { challengeApi } from '../api/index';
import type { Challenge } from '../types/index';

export const useChallenges = () => {
    const { challenges, setChallenges } = useChallengeStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChallenges = useCallback(async () => {
        setLoading(true);
        try {
            const data = await challengeApi.getChallenges();
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
            const newChallenge = await challengeApi.addChallenge(challenge);
            setChallenges([...challenges, newChallenge]);
            return newChallenge;
        } catch (err: any) {
            setError(err.message || 'Failed to add challenge');
            throw err;
        }
    }, []);

    const updateChallenge = useCallback(async (id: string, updates: Partial<Challenge>) => {
        try {
            // Optimistic update
            setChallenges(challenges.map(c => c.id === id ? { ...c, ...updates } : c));

            const existing = challenges.find(c => c.id === id);
            if (!existing) return;
            const fullUpdated = { ...existing, ...updates };

            await challengeApi.updateChallenge(id, fullUpdated);
        } catch (err: any) {
            setError(err.message || 'Failed to update challenge');
            fetchChallenges();
        }
    }, [challenges, fetchChallenges]);

    const deleteChallenge = useCallback(async (id: string) => {
        try {
            setChallenges(challenges.filter(c => c.id !== id));
            await challengeApi.deleteChallenge(id);
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
