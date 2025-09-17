import express from 'express';
import {
    createCompanyAdmin,
    loginCompanyAdmin,
    createState,
    createDistrict,
    createBlock,
    getStatesByCompany,
    getDistrictsByCompany,
    getBlocksByCompany
} from '../controllers/companyAdminController.js';
import { protectCompanyAdmin } from '../middleware/authenticationMiddleware.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/', createCompanyAdmin);
router.post('/login', loginCompanyAdmin);

// --- Location Management Routes ---
// These routes would ideally be protected by middleware to ensure the user is an authenticated CompanyAdmin
router.post('/states', protectCompanyAdmin, createState);
router.post('/districts', protectCompanyAdmin, createDistrict);
router.post('/blocks', protectCompanyAdmin, createBlock);
router.get('/getStates', protectCompanyAdmin, getStatesByCompany);
router.get('/getDistricts', protectCompanyAdmin, getDistrictsByCompany);
router.get('/getBlocks', protectCompanyAdmin, getBlocksByCompany);

export default router;
