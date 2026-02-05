import express from 'express';
import { resetAllData } from '../controllers/systemController';

const router = express.Router();

router.delete('/danger/reset', resetAllData);

export default router;
