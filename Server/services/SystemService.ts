import Task from '../models/Task';
import Challenge from '../models/Challenge';
import PomodoroStats from '../models/PomodoroStats';

export class SystemService {
    static async resetAllData(userId: string) {
        return await Promise.all([
            Task.deleteMany({ userId }),
            Challenge.deleteMany({ userId }),
            PomodoroStats.deleteMany({ userId })
        ]);
    }
}
