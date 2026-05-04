import mongoose from 'mongoose';

const DailyProgressSchema = new mongoose.Schema({
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    userId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    completedProtocolTaskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProtocolTask' }],
    overrides: {
        type: Map,
        of: new mongoose.Schema({
            text: String,
            completed: Boolean,
            time: String
        }, { _id: false })
    }
}, { timestamps: true });

DailyProgressSchema.index({ challengeId: 1, userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyProgress', DailyProgressSchema);
