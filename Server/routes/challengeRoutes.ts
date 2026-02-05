import express from 'express';
import { getChallenges, createChallenge, updateChallenge, deleteChallenge } from '../controllers/challengeController';

const router = express.Router();

router.get('/', getChallenges);
router.post('/', createChallenge);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

export default router;
