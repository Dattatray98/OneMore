import { useState, useCallback } from 'react';
import { api } from '../api';
import type { Task } from '../types';

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTasks();
            setTasks(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, []);

    const addTask = useCallback(async (task: Task) => {
        try {
            const newTask = await api.addTask(task);
            setTasks(prev => [newTask, ...prev]);
            return newTask;
        } catch (err: any) {
            setError(err.message || 'Failed to add task');
            throw err;
        }
    }, []);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        try {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            await api.updateTask(id, updates);
        } catch (err: any) {
            setError(err.message || 'Failed to update task');
            // Revert optimistic update? For now, we assume simple error handling.
            fetchTasks();
        }
    }, [fetchTasks]);

    const deleteTask = useCallback(async (id: string) => {
        try {
            setTasks(prev => prev.filter(t => t.id !== id));
            await api.deleteTask(id);
        } catch (err: any) {
            setError(err.message || 'Failed to delete task');
            fetchTasks();
        }
    }, [fetchTasks]);

    const toggleTask = useCallback(async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            await updateTask(id, { completed: !task.completed });
        }
    }, [tasks, updateTask]);

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask
    };
};
