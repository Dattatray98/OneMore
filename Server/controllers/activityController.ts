import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/ActivityService';

export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { actionType, entityType, startDate, endDate } = req.query;
        const filters = {
            actionType,
            entityType,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        };

        const logs = await ActivityService.getLogs((req as any).userId, filters);
        res.json(logs);
    } catch (error) {
        next(error);
    }
};
