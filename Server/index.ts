import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://jojewardattatray_db_user:MIFx8psdrtroevVH@cluster0.navwmzg.mongodb.net/taskdailydb';

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err: any) => console.error('MongoDB connection error:', err));

// --- SCHEMAS ---

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

const ChallengeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
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

const PomodoroStatsSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    workSecs: { type: Number, default: 0 },
    breakSecs: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 },
    sequence: { type: Array, default: [] }
});

const Task = mongoose.model('Task', TaskSchema);
const Challenge = mongoose.model('Challenge', ChallengeSchema);
const PomodoroStats = mongoose.model('PomodoroStats', PomodoroStatsSchema);

// --- ROUTES ---

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// --- TASKS API ---

app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save task' });
    }
});

app.put('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        await Task.findOneAndUpdate({ id }, updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
        await Task.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// --- CHALLENGES API ---

app.get('/api/challenges', async (req: Request, res: Response) => {
    try {
        const challenges = await Challenge.find();
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
});

app.post('/api/challenges', async (req: Request, res: Response) => {
    try {
        const c = new Challenge(req.body);
        await c.save();
        res.status(201).json(c);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save challenge' });
    }
});

app.put('/api/challenges/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const c = req.body;
        await Challenge.findOneAndUpdate({ id }, c);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update challenge' });
    }
});

app.delete('/api/challenges/:id', async (req: Request, res: Response) => {
    try {
        await Challenge.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete challenge' });
    }
});

app.delete('/api/danger/reset', async (req: Request, res: Response) => {
    try {
        await Promise.all([
            Task.deleteMany({}),
            Challenge.deleteMany({}),
            PomodoroStats.deleteMany({})
        ]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset data' });
    }
});

// --- POMODORO STATS API ---

app.get('/api/pomodoro/stats/:date', async (req: Request, res: Response) => {
    try {
        const stats = await PomodoroStats.findOne({ date: req.params.date });
        if (!stats) return res.json({ workSecs: 0, breakSecs: 0, sessionCount: 0, sequence: [] });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pomodoro stats' });
    }
});

app.get('/api/pomodoro/stats', async (req: Request, res: Response) => {
    try {
        const stats = await PomodoroStats.find();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all pomodoro stats' });
    }
});

app.post('/api/pomodoro/stats/:date', async (req: Request, res: Response) => {
    try {
        const date = req.params.date;
        const data = req.body;
        await PomodoroStats.findOneAndUpdate(
            { date },
            { ...data, date },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save pomodoro stats' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
