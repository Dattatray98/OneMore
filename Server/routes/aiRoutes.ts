import express from 'express';
import { getAIInsights } from '../controllers/aiController';

const router = express.Router();

router.get('/insights', getAIInsights);

export default router;
