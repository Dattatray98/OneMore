import { Request, Response } from 'express';
import Challenge from '../models/Challenge';

export const getChallenges = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        const challenges = await Challenge.find({ userId });
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
};

export const createChallenge = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        const c = new Challenge({ ...req.body, userId });
        await c.save();
        res.status(201).json(c);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save challenge' });
    }
};

export const updateChallenge = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        const id = req.params.id;
        const c = req.body;
        await Challenge.findOneAndUpdate({ id, userId }, c);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update challenge' });
    }
};

export const deleteChallenge = async (req: any, res: Response) => {
    try {
        const userId = req.auth.userId;
        await Challenge.findOneAndDelete({ id: req.params.id, userId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete challenge' });
    }
};
