import cron from 'node-cron';
import Task from '../models/Task';
import Notification from '../models/Notification';
import { format, addHours, startOfHour, endOfHour } from 'date-fns';

export const startReminderJob = () => {
    // Run every hour at the top of the hour
    cron.schedule('0 * * * *', async () => {
        console.log('[Job] Checking for upcoming task reminders...');
        const now = new Date();
        const oneHourFromNow = addHours(now, 1);
        const todayStr = format(now, 'yyyy-MM-dd');
        
        try {
            // Find tasks scheduled for today that are not completed
            const upcomingTasks = await Task.find({
                scheduledDate: todayStr,
                completed: false,
                scheduledTime: { $exists: true, $ne: null }
            });

            for (const task of upcomingTasks) {
                // Check if we already sent a notification for this task in the last few hours
                const existing = await Notification.findOne({
                    userId: task.userId,
                    link: `/app?taskId=${task.id}`,
                    createdAt: { $gte: startOfHour(now) }
                });

                if (!existing) {
                    await Notification.create({
                        userId: task.userId,
                        message: `Reminder: ${task.text} is scheduled for today at ${task.scheduledTime}`,
                        type: 'reminder',
                        link: `/app?taskId=${task.id}`
                    });
                    console.log(`[Job] Created notification for task: "${task.text}"`);
                }
            }
        } catch (error) {
            console.error('[Job] Reminder Job failed:', error);
        }
    });
};
