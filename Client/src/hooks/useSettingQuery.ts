import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingApi } from '../api/settingApi';

export const useSettingQuery = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery({
        queryKey: ['settings'],
        queryFn: settingApi.getSettings,
        staleTime: Infinity, // Settings don't change often
    });

    const updateSettingsMutation = useMutation({
        mutationFn: settingApi.updateSettings,
        onSuccess: (data) => {
            queryClient.setQueryData(['settings'], data);
        },
    });

    return {
        settings: settingsQuery.data,
        isLoading: settingsQuery.isLoading,
        updateSettings: updateSettingsMutation.mutateAsync,
    };
};
