import { Request, Response } from 'express';
import Task from '../models/Task';
import Challenge from '../models/Challenge';
import PomodoroStats from '../models/PomodoroStats';

export const resetAllData = async (req: Request, res: Response) => {
    try {
        await Promise.all([
            Task.deleteMany({}),
            Challenge.deleteMany({}),
            PomodoroStats.deleteMany({})
        ]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset data' });
    }
};
