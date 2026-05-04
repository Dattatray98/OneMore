import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';

export const useNotificationQuery = () => {
    const queryClient = useQueryClient();

    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        refetchInterval: 1000 * 60 * 5, // Check every 5 minutes
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    return {
        notifications: notificationsQuery.data || [],
        isLoading: notificationsQuery.isLoading,
        unreadCount: (notificationsQuery.data || []).filter((n: any) => !n.read).length,
        markAsRead: markAsReadMutation.mutateAsync,
        markAllAsRead: markAllAsReadMutation.mutateAsync,
    };
};
