import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/index';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../types/index';

export const useTaskQuery = () => {
    const queryClient = useQueryClient();
    const { setTasks } = useTaskStore();

    const tasksQuery = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const data = await taskApi.getTasks();
            setTasks(data); // Sync with store for components still using store
            return data;
        },
    });

    const addTaskMutation = useMutation({
        mutationFn: taskApi.addTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => 
            taskApi.updateTask(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: taskApi.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    return {
        tasks: tasksQuery.data || [],
        isLoading: tasksQuery.isLoading,
        isError: tasksQuery.isError,
        error: tasksQuery.error,
        addTask: addTaskMutation.mutateAsync,
        updateTask: updateTaskMutation.mutateAsync,
        deleteTask: deleteTaskMutation.mutateAsync,
        refetchTasks: tasksQuery.refetch,
    };
};
