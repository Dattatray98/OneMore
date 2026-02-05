import mongoose from 'mongoose';

const PomodoroStatsSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    workSecs: { type: Number, default: 0 },
    breakSecs: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 },
    sequence: { type: Array, default: [] }
});

const PomodoroStats = mongoose.model('PomodoroStats', PomodoroStatsSchema);

export default PomodoroStats;
