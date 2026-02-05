import { Request, Response } from 'express';
import Task from '../models/Task';
import Challenge from '../models/Challenge';
import PomodoroStats from '../models/PomodoroStats';

export const resetAllData = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        await Promise.all([
            Task.deleteMany({ userId }),
            Challenge.deleteMany({ userId }),
            PomodoroStats.deleteMany({ userId })
        ]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset data' });
    }
};
