import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = express.Router();

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
