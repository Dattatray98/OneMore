import Challenge from '../models/Challenge';
import { ActivityService } from './ActivityService';

export class ChallengeService {
    static async getAllChallenges(userId: string) {
        return await Challenge.find({ userId });
    }

    static async createChallenge(userId: string, data: any) {
        const challenge = new Challenge({ ...data, userId });
        const saved = await challenge.save();
        await ActivityService.log({
            userId,
            actionType: 'create',
            entityType: 'challenge',
            entityId: saved.id,
            description: `Started new challenge: "${saved.title}"`
        });
        return saved;
    }

    static async updateChallenge(userId: string, id: string, data: any) {
        const updated = await Challenge.findOneAndUpdate({ id, userId }, data, { new: true });
        if (updated) {
            await ActivityService.log({
                userId,
                actionType: 'update',
                entityType: 'challenge',
                entityId: updated.id,
                description: `Updated challenge: "${updated.title}"`,
                metadata: data
            });
        }
        return updated;
    }

    static async deleteChallenge(userId: string, id: string) {
        const deleted = await Challenge.findOneAndDelete({ id, userId });
        if (deleted) {
            await ActivityService.log({
                userId,
                actionType: 'delete',
                entityType: 'challenge',
                entityId: deleted.id,
                description: `Deleted challenge: "${deleted.title}"`
            });
        }
        return deleted;
    }
}

