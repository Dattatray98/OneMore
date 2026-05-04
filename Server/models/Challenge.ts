import mongoose from 'mongoose';

const ChallengeSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Logic ID used by frontend
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    days: { type: Number, required: true },
    startDate: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    
    // The following fields are now handled by ProtocolTask and DailyProgress
    // We keep them in the schema for backward compatibility during migration
    dailyRoutine: { type: Array, default: [] },
    completedDays: { type: [Number], default: [] },
    dailyProgress: { type: Map, of: Array, default: {} },
    dailyOverrides: { type: Map, of: Object, default: {} },
}, { timestamps: true });

ChallengeSchema.index({ userId: 1 });
ChallengeSchema.index({ id: 1, userId: 1 }, { unique: true });

const Challenge = mongoose.model('Challenge', ChallengeSchema);

export default Challenge;
