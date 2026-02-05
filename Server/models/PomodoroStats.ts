import mongoose from 'mongoose';

const PomodoroStatsSchema = new mongoose.Schema({
    date: { type: String, required: true },
    userId: { type: String, required: true },
    workSecs: { type: Number, default: 0 },
    breakSecs: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 },
    sequence: { type: Array, default: [] }
});

PomodoroStatsSchema.index({ date: 1, userId: 1 }, { unique: true });

const PomodoroStats = mongoose.model('PomodoroStats', PomodoroStatsSchema);

export default PomodoroStats;
