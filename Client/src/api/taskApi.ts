import { apiClient } from './client';
import type { Task } from '../types/index';

export const taskApi = {
    getTasks: async (): Promise<Task[]> => {
        const res = await apiClient.get<Task[]>('/tasks');
        return res.data;
    },
    
    addTask: async (task: Task): Promise<Task> => {
        const res = await apiClient.post<Task>('/tasks', task);
        return res.data;
    },
    
    updateTask: async (id: string, updates: Partial<Task>): Promise<void> => {
        await apiClient.put(`/tasks/${id}`, updates);
    },
    
    deleteTask: async (id: string): Promise<void> => {
        await apiClient.delete(`/tasks/${id}`);
    }
};
