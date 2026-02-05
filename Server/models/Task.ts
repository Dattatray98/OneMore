import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Number, required: true },
    scheduledDate: { type: String },
    scheduledTime: { type: String },
    isProtocol: { type: Boolean, default: false },
    protocolIdx: { type: Number }
});

const Task = mongoose.model('Task', TaskSchema);

export default Task;
