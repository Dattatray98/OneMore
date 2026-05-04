import Task from '../models/Task';
import { ActivityService } from './ActivityService';

export class TaskService {
    static async getAllTasks(userId: string) {
        return await Task.find({ userId }).sort({ createdAt: -1 });
    }

    static async createTask(userId: string, data: any) {
        const task = new Task({ ...data, userId });
        const saved = await task.save();
        await ActivityService.log({
            userId,
            actionType: 'create',
            entityType: 'task',
            entityId: saved.id,
            description: `Created task: "${saved.text}"`
        });
        return saved;
    }

    static async updateTask(userId: string, id: string, updates: any) {
        const updated = await Task.findOneAndUpdate({ id, userId }, updates, { new: true });
        if (updated) {
            const action = updates.completed === true ? 'complete' : 'update';
            await ActivityService.log({
                userId,
                actionType: action,
                entityType: 'task',
                entityId: updated.id,
                description: action === 'complete' ? `Completed task: "${updated.text}"` : `Updated task: "${updated.text}"`,
                metadata: updates
            });
        }
        return updated;
    }

    static async deleteTask(userId: string, id: string) {
        const deleted = await Task.findOneAndDelete({ id, userId });
        if (deleted) {
            await ActivityService.log({
                userId,
                actionType: 'delete',
                entityType: 'task',
                entityId: deleted.id,
                description: `Deleted task: "${deleted.text}"`
            });
        }
        return deleted;
    }
}

