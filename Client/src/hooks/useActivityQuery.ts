import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/activityApi';

export const useActivityQuery = (filters: any = {}) => {
    return useQuery({
        queryKey: ['activity', filters],
        queryFn: () => activityApi.getActivities(filters),
    });
};
