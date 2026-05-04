import mongoose from 'mongoose';

const FocusSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: Date, required: true },
    durationSecs: { type: Number, required: true },
    type: { type: String, enum: ['work', 'shortBreak', 'longBreak'], default: 'work' },
    taskId: { type: String }, // Reference to Task.id (String based for now)
    completed: { type: Boolean, default: true }
}, { timestamps: true });

FocusSessionSchema.index({ userId: 1, date: 1 });

export default mongoose.model('FocusSession', FocusSessionSchema);
