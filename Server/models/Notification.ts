import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['reminder', 'alert', 'success'], default: 'reminder' },
    read: { type: Boolean, default: false },
    link: { type: String }, // Optional link to task or challenge
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
