import { Request, Response } from 'express';
import PomodoroStats from '../models/PomodoroStats';

export const getPomodoroStatsByDate = async (req: any, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const stats = await PomodoroStats.findOne({ date: req.params.date, userId });
        if (!stats) return res.json({ workSecs: 0, breakSecs: 0, sessionCount: 0, sequence: [] });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pomodoro stats' });
    }
};

export const getAllPomodoroStats = async (req: any, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const stats = await PomodoroStats.find({ userId });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all pomodoro stats' });
    }
};

export const updatePomodoroStats = async (req: any, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const date = req.params.date;
        const data = req.body;
        await PomodoroStats.findOneAndUpdate(
            { date, userId },
            { ...data, date, userId },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save pomodoro stats' });
    }
};

export const clearPomodoroStats = async (req: any, res: Response) => {
    try {
        const userId = req.auth?.userId;
        await PomodoroStats.deleteMany({ userId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear pomodoro stats' });
    }
};
