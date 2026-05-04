import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/AIService';

export const getAIInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const insights = await AIService.generateSuggestions((req as any).userId);
        res.json(insights);
    } catch (error) {
        next(error);
    }
};
