import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/aiApi';

export const useAIQuery = () => {
    return useQuery({
        queryKey: ['aiInsights'],
        queryFn: aiApi.getInsights,
        staleTime: 1000 * 60 * 30, // Insights don't change every minute
    });
};
