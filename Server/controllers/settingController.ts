import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../services/SettingService';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await SettingService.getSettings((req as any).userId);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await SettingService.updateSettings((req as any).userId, req.body);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};
