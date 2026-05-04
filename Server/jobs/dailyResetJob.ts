import cron from 'node-cron';
import Challenge from '../models/Challenge';
import { format, subDays } from 'date-fns';

export const startDailyResetJob = () => {
    // Run at 00:01 every day
    cron.schedule('1 0 * * *', async () => {
        console.log('[Job] Starting Daily Reset Job...');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        
        try {
            // Find active challenges
            const activeChallenges = await Challenge.find({ isActive: true });
            
            for (const challenge of activeChallenges) {
                // Logic: If yesterday is not in completedDays, mark it as failed (simplified example)
                // In a more complex version, we would check DailyProgress collection
                console.log(`[Job] Processing challenge: ${challenge.title}`);
                // Example: Check if progress exists for yesterday
                // This is a placeholder for actual business logic depends on the specific rules
            }
            
            console.log('[Job] Daily Reset Job completed successfully.');
        } catch (error) {
            console.error('[Job] Daily Reset Job failed:', error);
        }
    });
};
