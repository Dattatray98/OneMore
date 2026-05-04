import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded: any = AuthService.verifyToken(token);
                (req as any).auth = { userId: decoded.userId };
                (req as any).userId = decoded.userId;
            } catch (err) {
                // Invalid token - clear auth
                (req as any).auth = null;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).userId) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }
    next();
};
