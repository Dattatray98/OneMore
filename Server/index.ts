import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

import taskRoutes from './routes/taskRoutes';
import challengeRoutes from './routes/challengeRoutes';
import pomodoroRoutes from './routes/pomodoroRoutes';
import systemRoutes from './routes/systemRoutes';
import { authMiddleware } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: true, // Reflects the request origin, allowing all origins
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
app.use(authMiddleware);

app.use('/api/tasks', requireAuth(), taskRoutes);
app.use('/api/challenges', requireAuth(), challengeRoutes);
app.use('/api/pomodoro', requireAuth(), pomodoroRoutes);
app.use('/api', requireAuth(), systemRoutes);

// Error Handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
