import { NextFunction, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { taskSchema, updateTaskSchema } from '../validators/taskValidator';

export const getTasks = async (req: any, res: Response, next: NextFunction) => {
    try {
        const tasks = await TaskService.getAllTasks(req.auth?.userId);
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validatedData = taskSchema.parse(req.body);
        const task = await TaskService.createTask(req.auth?.userId, validatedData);
        res.status(201).json(task);
    } catch (error: any) {
        next(error);
    }
};

export const updateTask = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validatedData = updateTaskSchema.parse(req.body);
        await TaskService.updateTask(req.auth?.userId, req.params.id, validatedData);
        res.json({ success: true });
    } catch (error: any) {
        next(error);
    }
};

export const deleteTask = async (req: any, res: Response, next: NextFunction) => {
    try {
        await TaskService.deleteTask(req.auth?.userId, req.params.id);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
