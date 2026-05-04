import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await AuthService.register(email, password);
        res.status(201).json({ success: true, userId: user._id });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.login(email, password);
        res.json({ success: true, token, user: { id: user._id, email: user.email } });
    } catch (error) {
        next(error);
    }
};
