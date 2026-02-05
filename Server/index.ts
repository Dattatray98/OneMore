import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

import taskRoutes from './routes/taskRoutes';
import challengeRoutes from './routes/challengeRoutes';
import pomodoroRoutes from './routes/pomodoroRoutes';
import systemRoutes from './routes/systemRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Connect to Database
connectDB();

// Middleware
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

import { clerkMiddleware, requireAuth } from '@clerk/express';

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Protected Routes
app.use(clerkMiddleware());

app.use('/api/tasks', requireAuth(), taskRoutes);
app.use('/api/challenges', requireAuth(), challengeRoutes);
app.use('/api/pomodoro', requireAuth(), pomodoroRoutes);
app.use('/api', requireAuth(), systemRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
