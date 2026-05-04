import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import compression from 'compression';

import taskRoutes from './routes/taskRoutes';
import challengeRoutes from './routes/challengeRoutes';
import pomodoroRoutes from './routes/pomodoroRoutes';
import systemRoutes from './routes/systemRoutes';
import authRoutes from './routes/authRoutes';
import settingRoutes from './routes/settingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import activityRoutes from './routes/activityRoutes';
import aiRoutes from './routes/aiRoutes';
import { authMiddleware, requireAuth } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { startDailyResetJob } from './jobs/dailyResetJob';
import { startReminderJob } from './jobs/reminderJob';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Connect to Database
connectDB();

// Security & Optimization Middleware
app.use(helmet());
app.use(compression()); // Compress all responses
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, 
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiter to API routes
app.use('/api/', limiter);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
            return callback(new Error('CORS blocked'), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use(authMiddleware);

app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/challenges', requireAuth, challengeRoutes);
app.use('/api/pomodoro', requireAuth, pomodoroRoutes);
app.use('/api/settings', requireAuth, settingRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);
app.use('/api/activity', requireAuth, activityRoutes);
app.use('/api/ai', requireAuth, aiRoutes);
app.use('/api', requireAuth, systemRoutes);

// Initialize Background Jobs
startDailyResetJob();
startReminderJob();

// Error Handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
