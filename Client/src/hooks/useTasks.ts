import { useCallback, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { taskApi } from '../api/index';
import type { Task } from '../types/index';

export const useTasks = () => {
    const { tasks, setTasks } = useTaskStore();
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await taskApi.getTasks();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error(err);
        } finally {
        }
    }, []);

    const addTask = useCallback(async (task: Task) => {
        try {
            const newTask = await taskApi.addTask(task);
            setTasks([newTask, ...tasks]);
            return newTask;
        } catch (err: any) {
            throw err;
        }
    }, []);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        try {
            setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
            await taskApi.updateTask(id, updates);
        } catch (err: any) {
            fetchTasks();
        }
    }, [fetchTasks]);

    const deleteTask = useCallback(async (id: string) => {
        try {
            setTasks(tasks.filter(t => t.id !== id));
            await taskApi.deleteTask(id);
        } catch (err: any) {
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
