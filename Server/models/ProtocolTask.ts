import mongoose from 'mongoose';

const ProtocolTaskSchema = new mongoose.Schema({
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    userId: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String },
    order: { type: Number, default: 0 },
});

ProtocolTaskSchema.index({ challengeId: 1, userId: 1 });

export default mongoose.model('ProtocolTask', ProtocolTaskSchema);
