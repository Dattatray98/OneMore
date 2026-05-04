import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await NotificationService.getNotifications((req as any).userId);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const notification = await NotificationService.markAsRead((req as any).userId, id);
        res.json(notification);
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await NotificationService.markAllAsRead((req as any).userId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
