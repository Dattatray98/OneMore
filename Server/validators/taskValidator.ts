import { z } from 'zod';

export const taskSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Task text is required').max(500),
    completed: z.boolean().optional().default(false),
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    createdAt: z.number().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const updateTaskSchema = taskSchema.partial();
