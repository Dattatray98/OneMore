import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// Initialize Database
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'onemore.db');
const db = new Database(dbPath);

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    createdAt INTEGER,
    scheduledDate TEXT,
    scheduledTime TEXT,
    isProtocol INTEGER DEFAULT 0,
    protocolIdx INTEGER
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    dailyRoutine TEXT, -- JSON string
    days INTEGER,
    startDate TEXT,
    completedDays TEXT, -- JSON string array
    dailyProgress TEXT, -- JSON record
    dailyOverrides TEXT, -- JSON record
    refreshTime TEXT,
    history TEXT -- JSON string array
  );

  CREATE TABLE IF NOT EXISTS pomodoro_stats (
    date TEXT PRIMARY KEY,
    workSecs INTEGER DEFAULT 0,
    breakSecs INTEGER DEFAULT 0,
    sessionCount INTEGER DEFAULT 0,
    sequence TEXT -- JSON string array
  );
`);

// --- TASKS API ---

app.get('/api/tasks', (req: Request, res: Response) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all() as any[];
    // Map SQLite 0/1 to Boolean
    const mappedTasks = tasks.map(t => ({
        ...t,
        completed: !!t.completed,
        isProtocol: !!t.isProtocol,
        createdAt: Number(t.createdAt)
    }));
    res.json(mappedTasks);
});

app.post('/api/tasks', (req: Request, res: Response) => {
    const task = req.body;
    const insert = db.prepare(`
    INSERT INTO tasks (id, text, completed, createdAt, scheduledDate, scheduledTime, isProtocol, protocolIdx)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    insert.run(
        task.id,
        task.text,
        task.completed ? 1 : 0,
        task.createdAt,
        task.scheduledDate || null,
        task.scheduledTime || null,
        task.isProtocol ? 1 : 0,
        task.protocolIdx || null
    );
    res.status(201).json(task);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const updates = req.body;

    // Dynamic update builder
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.json({ message: 'No updates' });

    const setClause = keys.map(k => {
        return `${k} = ?`;
    }).join(', ');

    const values = keys.map(k => {
        if (k === 'completed' || k === 'isProtocol') return updates[k] ? 1 : 0;
        return updates[k];
    });

    const query = `UPDATE tasks SET ${setClause} WHERE id = ?`;
    db.prepare(query).run(...values, id);
    res.json({ success: true });
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// --- CHALLENGES API ---

app.get('/api/challenges', (req: Request, res: Response) => {
    const challenges = db.prepare('SELECT * FROM challenges').all() as any[];
    const mappedChallenges = challenges.map(c => ({
        ...c,
        dailyRoutine: JSON.parse(c.dailyRoutine || '[]'),
        completedDays: JSON.parse(c.completedDays || '[]'),
        dailyProgress: JSON.parse(c.dailyProgress || '{}'),
        dailyOverrides: JSON.parse(c.dailyOverrides || '{}'),
        history: JSON.parse(c.history || '[]')
    }));
    res.json(mappedChallenges);
});

app.post('/api/challenges', (req: Request, res: Response) => {
    const c = req.body;
    const insert = db.prepare(`
    INSERT INTO challenges (id, title, description, dailyRoutine, days, startDate, completedDays, dailyProgress, dailyOverrides, refreshTime, history)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    insert.run(
        c.id,
        c.title,
        c.description || null,
        JSON.stringify(c.dailyRoutine || []),
        c.days,
        c.startDate,
        JSON.stringify(c.completedDays || []),
        JSON.stringify(c.dailyProgress || {}),
        JSON.stringify(c.dailyOverrides || {}),
        c.refreshTime,
        JSON.stringify(c.history || [])
    );
    res.status(201).json(c);
});

app.put('/api/challenges/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const c = req.body;

    const update = db.prepare(`
        UPDATE challenges 
        SET title = ?, description = ?, dailyRoutine = ?, days = ?, startDate = ?, completedDays = ?, dailyProgress = ?, dailyOverrides = ?, refreshTime = ?, history = ?
        WHERE id = ?
    `);

    update.run(
        c.title,
        c.description || null,
        JSON.stringify(c.dailyRoutine || []),
        c.days,
        c.startDate,
        JSON.stringify(c.completedDays || []),
        JSON.stringify(c.dailyProgress || {}),
        JSON.stringify(c.dailyOverrides || {}),
        c.refreshTime,
        JSON.stringify(c.history || []),
        id
    );
    res.json({ success: true });
});

app.delete('/api/challenges/:id', (req: Request, res: Response) => {
    db.prepare('DELETE FROM challenges WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

app.delete('/api/danger/reset', (req: Request, res: Response) => {
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM challenges').run();
    db.prepare('DELETE FROM pomodoro_stats').run();
    res.json({ success: true });
});

// --- POMODORO STATS API ---

app.get('/api/pomodoro/stats/:date', (req: Request, res: Response) => {
    const stats = db.prepare('SELECT * FROM pomodoro_stats WHERE date = ?').get(req.params.date) as any;
    if (!stats) return res.json({ workSecs: 0, breakSecs: 0, sessionCount: 0, sequence: [] });
    res.json({
        ...stats,
        sequence: JSON.parse(stats.sequence || '[]')
    });
});

app.get('/api/pomodoro/stats', (req: Request, res: Response) => {
    const stats = db.prepare('SELECT * FROM pomodoro_stats').all() as any[];
    res.json(stats.map(s => ({ ...s, sequence: JSON.parse(s.sequence || '[]') })));
});

app.post('/api/pomodoro/stats/:date', (req: Request, res: Response) => {
    const date = req.params.date;
    const { workSecs, breakSecs, sessionCount, sequence } = req.body;

    const existing = db.prepare('SELECT date FROM pomodoro_stats WHERE date = ?').get(date);
    if (existing) {
        db.prepare(`
      UPDATE pomodoro_stats 
      SET workSecs = ?, breakSecs = ?, sessionCount = ?, sequence = ? 
      WHERE date = ?
    `).run(workSecs, breakSecs, sessionCount, JSON.stringify(sequence || []), date);
    } else {
        db.prepare(`
      INSERT INTO pomodoro_stats (date, workSecs, breakSecs, sessionCount, sequence)
      VALUES (?, ?, ?, ?, ?)
    `).run(date, workSecs || 0, breakSecs || 0, sessionCount || 0, JSON.stringify(sequence || []));
    }
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
