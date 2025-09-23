import express from 'express';
import {
    createSchool,
    getSchoolsByCompany,
    createTrade,
    getAllTrades,
    assignTradeToSchool,
    createTrainer,
    loginTrainer,
    createSchoolWithMultipleTrainers,
    getSchoolsWithDetails
} from '../controllers/schoolController.js';
import { protectCompanyAdmin } from '../middleware/authenticationMiddleware.js';
import authMiddleware from '../middleware/auth.js';
const router = express.Router();

// --- School Routes (Protected) ---
router.route('/schools')
    .post(protectCompanyAdmin, createSchool)
    .get(protectCompanyAdmin, getSchoolsByCompany);

// --- Trade Routes (Public GET, Protected POST for creation) ---
router.route('/trades')
    .post(createTrade) // Should ideally be protected for SuperAdmin
    .get(getAllTrades);

// --- School-Trade Assignment (Protected) ---
router.post('/schools/assign-trade', protectCompanyAdmin, assignTradeToSchool);

// --- Trainer Routes (Protected) ---
router.post('/trainers', protectCompanyAdmin, createTrainer);
router.post('/schools/create-with-trainers', protectCompanyAdmin, createSchoolWithMultipleTrainers);
router.get('/schools/details', protectCompanyAdmin, getSchoolsWithDetails);
router.post('/trainers/login', loginTrainer);

export default router;


