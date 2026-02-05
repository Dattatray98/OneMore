import { Request, Response } from 'express';
import Challenge from '../models/Challenge';

export const getChallenges = async (req: Request, res: Response) => {
    try {
        const challenges = await Challenge.find();
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
};

export const createChallenge = async (req: Request, res: Response) => {
    try {
        const c = new Challenge(req.body);
        await c.save();
        res.status(201).json(c);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save challenge' });
    }
};

export const updateChallenge = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const c = req.body;
        await Challenge.findOneAndUpdate({ id }, c);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update challenge' });
    }
};

export const deleteChallenge = async (req: Request, res: Response) => {
    try {
        await Challenge.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete challenge' });
    }
};
