import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    actionType: { 
        type: String, 
        enum: ['create', 'update', 'delete', 'complete', 'undo'], 
        required: true 
    },
    entityType: { 
        type: String, 
        enum: ['task', 'challenge', 'protocol', 'pomodoro'], 
        required: true 
    },
    entityId: { type: String },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ entityId: 1 });

export default mongoose.model('ActivityLog', ActivityLogSchema);
