import ActivityLog from '../models/ActivityLog';

export class ActivityService {
    static async log(data: {
        userId: string;
        actionType: 'create' | 'update' | 'delete' | 'complete' | 'undo';
        entityType: 'task' | 'challenge' | 'protocol' | 'pomodoro';
        entityId?: string;
        description: string;
        metadata?: any;
    }) {
        try {
            const log = new ActivityLog(data);
            await log.save();
            return log;
        } catch (error) {
            console.error('[ActivityLog] Failed to create log:', error);
        }
    }

    static async getLogs(userId: string, filters: any = {}) {
        const query: any = { userId };
        if (filters.actionType) query.actionType = filters.actionType;
        if (filters.entityType) query.entityType = filters.entityType;
        if (filters.startDate && filters.endDate) {
            query.createdAt = { $gte: filters.startDate, $lte: filters.endDate };
        }

        return await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
    }
}
