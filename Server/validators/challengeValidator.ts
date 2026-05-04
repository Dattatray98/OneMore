import { z } from 'zod';

export const challengeSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().optional(),
    days: z.number().int().min(1).max(365),
    dailyRoutine: z.array(z.object({
        id: z.string(),
        text: z.string(),
        time: z.string().optional()
    })),
    startDate: z.string().optional(),
    completedDays: z.array(z.number()).optional(),
    failedDays: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
});

export const updateChallengeSchema = challengeSchema.partial();
