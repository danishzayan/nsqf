// routes/trainerRoutes.js
import express from 'express';
import upload from '../config/multerConfig.js';
import { uploadDoc } from '../controllers/trainerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/upload-doc',
  authMiddleware, // ensures req.user exists
  upload.single('document'),
  uploadDoc
);

export default router;
