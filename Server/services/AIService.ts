import ActivityLog from '../models/ActivityLog';
import Task from '../models/Task';
import DailyProgress from '../models/DailyProgress';
import { startOfDay, subDays, format } from 'date-fns';

export class AIService {
    static async analyzeUserBehavior(userId: string) {
        const last7Days = subDays(new Date(), 7);
        
        // 1. Fetch recent activity
        const logs = await ActivityLog.find({
            userId,
            createdAt: { $gte: last7Days }
        });

        const completedTasks = logs.filter(l => l.actionType === 'complete' && l.entityType === 'task');
        
        // 2. Identify Peak Productivity Hours
        const hourDistribution: Record<number, number> = {};
        completedTasks.forEach(log => {
            const hour = new Date(log.createdAt).getHours();
            hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
        });

        let peakHour = 0;
        let maxTasks = 0;
        Object.entries(hourDistribution).forEach(([hour, count]) => {
            if (count > maxTasks) {
                maxTasks = count;
                peakHour = parseInt(hour);
            }
        });

        // 3. Consistency Analysis (Streaks)
        const activeTasks = await Task.countDocuments({ userId, completed: false });
        
        // 4. Generate Deterministic Insights
        const insights = [];
        if (peakHour) {
            const period = peakHour >= 12 ? 'afternoon/evening' : 'morning';
            insights.push({
                type: 'peak_time',
                title: 'Peak Productivity',
                message: `You are most active in the ${period}. Try scheduling your hardest tasks around ${peakHour}:00.`
            });
        }

        if (completedTasks.length > 10) {
            insights.push({
                type: 'streak',
                title: 'Great Momentum!',
                message: `You've completed ${completedTasks.length} tasks in the last 7 days. Keep it up!`
            });
        } else if (activeTasks > 10) {
            insights.push({
                type: 'overload',
                title: 'Task Overload',
                message: `You have ${activeTasks} pending tasks. Consider breaking them down or postponing less urgent ones.`
            });
        }

        return {
            peakHour,
            totalCompleted: completedTasks.length,
            insights
        };
    }

    static async generateSuggestions(userId: string) {
        // Logic for smarter routine suggestions
        const analysis = await this.analyzeUserBehavior(userId);
        
        // Placeholder for LLM integration (e.g., OpenAI)
        // const prompt = `Analyze this user data: ${JSON.stringify(analysis)}...`;
        
        return {
            suggestions: analysis.insights,
            generatedAt: new Date()
        };
    }
}
