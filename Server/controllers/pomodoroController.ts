import { NextFunction, Response } from 'express';
import { PomodoroService } from '../services/PomodoroService';
import { pomodoroStatsSchema } from '../validators/pomodoroValidator';

export const getPomodoroStatsByDate = async (req: any, res: Response, next: NextFunction) => {
    try {
        const stats = await PomodoroService.getStatsByDate(req.auth?.userId, req.params.date);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const getAllPomodoroStats = async (req: any, res: Response, next: NextFunction) => {
    try {
        const stats = await PomodoroService.getAllStats(req.auth?.userId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const updatePomodoroStats = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validatedData = pomodoroStatsSchema.parse(req.body);
        await PomodoroService.updateStats(req.auth?.userId, req.params.date, validatedData);
        res.json({ success: true });
    } catch (error: any) {
        next(error);
    }
};

export const clearPomodoroStats = async (req: any, res: Response, next: NextFunction) => {
    try {
        await PomodoroService.clearAllStats(req.auth?.userId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
