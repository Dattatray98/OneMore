import { Request, Response } from 'express';
import PomodoroStats from '../models/PomodoroStats';

export const getPomodoroStatsByDate = async (req: Request, res: Response) => {
    try {
        const stats = await PomodoroStats.findOne({ date: req.params.date });
        if (!stats) return res.json({ workSecs: 0, breakSecs: 0, sessionCount: 0, sequence: [] });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pomodoro stats' });
    }
};

export const getAllPomodoroStats = async (req: Request, res: Response) => {
    try {
        const stats = await PomodoroStats.find();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all pomodoro stats' });
    }
};

export const updatePomodoroStats = async (req: Request, res: Response) => {
    try {
        const date = req.params.date;
        const data = req.body;
        await PomodoroStats.findOneAndUpdate(
            { date },
            { ...data, date },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save pomodoro stats' });
    }
};

export const clearPomodoroStats = async (req: Request, res: Response) => {
    try {
        await PomodoroStats.deleteMany({});
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear pomodoro stats' });
    }
};
