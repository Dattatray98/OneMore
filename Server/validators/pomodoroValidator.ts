import { z } from 'zod';

export const pomodoroStatsSchema = z.object({
    workSecs: z.number().nonnegative(),
    breakSecs: z.number().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
    sequence: z.array(z.any()).optional(), // Sequence can be any array for now
});
