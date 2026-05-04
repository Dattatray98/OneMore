import Notification from '../models/Notification';

export class NotificationService {
    static async getNotifications(userId: string) {
        return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    }

    static async markAsRead(userId: string, notificationId: string) {
        return await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );
    }

    static async markAllAsRead(userId: string) {
        return await Notification.updateMany({ userId, read: false }, { read: true });
    }
}
