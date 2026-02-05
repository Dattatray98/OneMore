import express from 'express';
import { getPomodoroStatsByDate, getAllPomodoroStats, updatePomodoroStats, clearPomodoroStats } from '../controllers/pomodoroController';

const router = express.Router();

router.get('/stats/:date', getPomodoroStatsByDate);
router.get('/stats', getAllPomodoroStats);
router.post('/stats/:date', updatePomodoroStats);
router.delete('/stats', clearPomodoroStats);

export default router;
