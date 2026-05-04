import { NextFunction, Response } from 'express';
import { ChallengeService } from '../services/ChallengeService';
import { challengeSchema, updateChallengeSchema } from '../validators/challengeValidator';

export const getChallenges = async (req: any, res: Response, next: NextFunction) => {
    try {
        const challenges = await ChallengeService.getAllChallenges(req.auth?.userId);
        res.json(challenges);
    } catch (error) {
        next(error);
    }
};

export const createChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validatedData = challengeSchema.parse(req.body);
        const challenge = await ChallengeService.createChallenge(req.auth?.userId, validatedData);
        res.status(201).json(challenge);
    } catch (error: any) {
        next(error);
    }
};

export const updateChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        const validatedData = updateChallengeSchema.parse(req.body);
        await ChallengeService.updateChallenge(req.auth?.userId, req.params.id, validatedData);
        res.json({ success: true });
    } catch (error: any) {
        next(error);
    }
};

export const deleteChallenge = async (req: any, res: Response, next: NextFunction) => {
    try {
        await ChallengeService.deleteChallenge(req.auth?.userId, req.params.id);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
