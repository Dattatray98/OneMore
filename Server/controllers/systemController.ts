import { NextFunction, Response } from 'express';
import { SystemService } from '../services/SystemService';

export const resetAllData = async (req: any, res: Response, next: NextFunction) => {
    try {
        await SystemService.resetAllData(req.auth?.userId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
