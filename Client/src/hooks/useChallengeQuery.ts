import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeApi } from '../api/index';
import { useChallengeStore } from '../store/useChallengeStore';
import type { Challenge } from '../types/index';

export const useChallengeQuery = () => {
    const queryClient = useQueryClient();
    const { setChallenges } = useChallengeStore();

    const challengesQuery = useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            const data = await challengeApi.getChallenges();
            setChallenges(data);
            return data;
        },
    });

    const addChallengeMutation = useMutation({
        mutationFn: challengeApi.addChallenge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
        },
    });

    const updateChallengeMutation = useMutation({
        mutationFn: ({ id, challenge }: { id: string; challenge: Challenge }) => 
            challengeApi.updateChallenge(id, challenge),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
        },
    });

    const deleteChallengeMutation = useMutation({
        mutationFn: challengeApi.deleteChallenge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
        },
    });

    return {
        challenges: challengesQuery.data || [],
        isLoading: challengesQuery.isLoading,
        isError: challengesQuery.isError,
        error: challengesQuery.error,
        addChallenge: addChallengeMutation.mutateAsync,
        updateChallenge: updateChallengeMutation.mutateAsync,
        deleteChallenge: deleteChallengeMutation.mutateAsync,
        refetchChallenges: challengesQuery.refetch,
    };
};
