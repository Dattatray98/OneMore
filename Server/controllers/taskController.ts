import { Request, Response } from 'express';
import Task from '../models/Task';

export const getTasks = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        const task = new Task({ ...req.body, userId });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save task' });
    }
};

export const updateTask = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        const id = req.params.id;
        const updates = req.body;
        await Task.findOneAndUpdate({ id, userId }, updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const deleteTask = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        await Task.findOneAndDelete({ id: req.params.id, userId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
