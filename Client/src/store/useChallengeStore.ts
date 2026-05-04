import { create } from 'zustand';
import type { Challenge } from '../types/index';

interface ChallengeState {
    challenges: Challenge[];
    activeChallengeId: string | null;
    plannedFilter: 'normal' | 'disciplined';
    plannedViewMode: 'week' | 'day';
    
    // Actions
    setChallenges: (challenges: Challenge[]) => void;
    setActiveChallengeId: (id: string | null) => void;
    setPlannedFilter: (filter: 'normal' | 'disciplined') => void;
    setPlannedViewMode: (mode: 'week' | 'day') => void;
    
    // Helper to get active challenge
    getActiveChallenge: () => Challenge | null;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
    challenges: [],
    activeChallengeId: localStorage.getItem('active_challenge_id'),
    plannedFilter: 'normal',
    plannedViewMode: 'week',

    setChallenges: (challenges) => set({ challenges }),
    
    setActiveChallengeId: (id) => {
        if (id) {
            localStorage.setItem('active_challenge_id', id);
        } else {
            localStorage.removeItem('active_challenge_id');
        }
        set({ activeChallengeId: id });
    },
    
    setPlannedFilter: (plannedFilter) => set({ plannedFilter }),
    
    setPlannedViewMode: (plannedViewMode) => set({ plannedViewMode }),
    
    getActiveChallenge: () => {
        const { challenges, activeChallengeId } = get();
        return challenges.find(c => c.id === activeChallengeId) || challenges[0] || null;
    }
}));
