import UserSetting from '../models/UserSetting';

export class SettingService {
    static async getSettings(userId: string) {
        let settings = await UserSetting.findOne({ userId });
        if (!settings) {
            settings = new UserSetting({ userId });
            await settings.save();
        }
        return settings;
    }

    static async updateSettings(userId: string, updates: any) {
        return await UserSetting.findOneAndUpdate(
            { userId },
            { $set: updates },
            { new: true, upsert: true }
        );
    }
}
