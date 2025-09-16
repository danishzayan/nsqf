import express from 'express';
import { createSuperAdmin, loginSuperAdmin, viewAllCompanies } from '../controllers/superAdminController.js';

const router = express.Router();

// @route   POST api/superadmins
// @desc    Create a new SuperAdmin
// @access  Public (should be protected in a real app)
router.post('/', createSuperAdmin);

// @route   POST api/superadmins/login
// @desc    Authenticate SuperAdmin & get token (placeholder)
// @access  Public
router.post('/login', loginSuperAdmin);


// @route   GET api/superadmins/companies
// @desc    View all companies
// @access  Protected (should be for SuperAdmins only)
router.get('/companies', viewAllCompanies);


export default router;
