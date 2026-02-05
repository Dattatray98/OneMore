import mongoose from 'mongoose';

const ChallengeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    dailyRoutine: { type: Array, default: [] },
    days: { type: Number, required: true },
    startDate: { type: String, required: true },
    completedDays: { type: [Number], default: [] },
    dailyProgress: { type: Map, of: Array, default: {} },
    dailyOverrides: { type: Map, of: Object, default: {} },
    refreshTime: { type: String },
    history: { type: Array, default: [] }
});

ChallengeSchema.index({ userId: 1 });
ChallengeSchema.index({ id: 1, userId: 1 }, { unique: true });

const Challenge = mongoose.model('Challenge', ChallengeSchema);

export default Challenge;
