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
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
        ];

        console.log('CORS Check - Origin:', origin);
        console.log('Allowed Origins:', allowedOrigins);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS Blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
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
