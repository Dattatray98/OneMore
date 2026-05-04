import mongoose from 'mongoose';

const UserSettingSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    pomodoro: {
        workTime: { type: Number, default: 25 },
        shortBreak: { type: Number, default: 5 },
        longBreak: { type: Number, default: 15 },
        autoStart: { type: Boolean, default: false }
    }
}, { timestamps: true });

UserSettingSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('UserSetting', UserSettingSchema);
