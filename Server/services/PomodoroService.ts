import PomodoroStats from '../models/PomodoroStats';

export class PomodoroService {
    static async getStatsByDate(userId: string, date: string) {
        const stats = await PomodoroStats.findOne({ date, userId });
        if (!stats) return { workSecs: 0, breakSecs: 0, sessionCount: 0, sequence: [] };
        return stats;
    }

    static async getAllStats(userId: string) {
        return await PomodoroStats.find({ userId });
    }

    static async updateStats(userId: string, date: string, data: any) {
        return await PomodoroStats.findOneAndUpdate(
            { date, userId },
            { ...data, date, userId },
            { upsert: true, new: true }
        );
    }

    static async clearAllStats(userId: string) {
        return await PomodoroStats.deleteMany({ userId });
    }
}
