// routes/trainerRoutes.js
import express from 'express';
// import upload from '../config/multerConfig.js';
import { markDailyStatus,checkOut } from '../controllers/trainerController.js';
import  authMiddleware  from '../middleware/auth.js';

const router = express.Router();

router.post('/mark-daily-status', authMiddleware, markDailyStatus);
router.post('/check-out',authMiddleware, checkOut);

export default router;
