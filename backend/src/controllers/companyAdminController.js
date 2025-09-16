import CompanyAdmin from '../models/CompanyAdmin.js';
import State from '../models/State.js';
import District from '../models/District.js';
import Block from '../models/Block.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, companyId) => {
    return jwt.sign({ id, companyId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};


// --- CompanyAdmin Authentication ---

/**
 * @description Create a new CompanyAdmin
 * @route POST /api/companyadmins
 */
export const createCompanyAdmin = async (req, res) => {
    try {
        const { username, email, password, companyId } = req.body;
        const existingAdmin = await CompanyAdmin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email or username already exists.' });
        }

        const companyAdmin = new CompanyAdmin({ username, email, password, companyId });
        await companyAdmin.save();

        const adminResponse = { ...companyAdmin.toObject() };
        delete adminResponse.password;

        res.status(201).json({ message: 'CompanyAdmin created successfully', user: adminResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating CompanyAdmin', error: error.message });
    }
};


/**
 * @description Login for CompanyAdmin and get a JWT
 * @route POST /api/companyadmins/login
 */
export const loginCompanyAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const companyAdmin = await CompanyAdmin.findOne({ email });

        if (!companyAdmin) {
            return res.status(404).json({ message: 'CompanyAdmin not found.' });
        }

        if (companyAdmin.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const adminResponse = { ...companyAdmin.toObject() };
        delete adminResponse.password;

        res.status(200).json({
            message: 'Login successful',
            user: adminResponse,
            // Generate and send the token
            token: generateToken(companyAdmin._id, companyAdmin.companyId)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};


// --- Location Management by CompanyAdmin ---
// These functions will now assume that the `protectCompanyAdmin` middleware has run
// and attached the authenticated user's data to `req.user`.

/**
 * @description Create a state for the admin's company
 * @route POST /api/companyadmins/states
 */
export const createState = async (req, res) => {
    try {
        const { name } = req.body;
        // The companyId now comes from the token via the middleware
        const companyId = req.user.companyId;

        const state = new State({ name, companyId });
        await state.save();
        res.status(201).send(state);
    } catch (error) {
        res.status(400).send(error);
    }
};

/**
 * @description Create a district for the admin's company
 * @route POST /api/companyadmins/districts
 */
export const createDistrict = async (req, res) => {
    try {
        const { name, stateId } = req.body;
        const companyId = req.user.companyId;
        
        const parentState = await State.findById(stateId);
        if (!parentState || parentState.companyId.toString() !== companyId.toString()) {
             return res.status(403).json({ message: 'State not found or does not belong to your company.' });
        }

        const district = new District({ name, stateId, companyId });
        await district.save();
        res.status(201).send(district);
    } catch (error) {
        res.status(400).send(error);
    }
};

/**
 * @description Create a block for the admin's company
 * @route POST /api/companyadmins/blocks
 */
export const createBlock = async (req, res) => {
    try {
        const { name, districtId, pincode } = req.body;
        const companyId = req.user.companyId;
        
        const parentDistrict = await District.findById(districtId);
        if (!parentDistrict || parentDistrict.companyId.toString() !== companyId.toString()) {
             return res.status(403).json({ message: 'District not found or does not belong to your company.' });
        }
        
        const block = new Block({ name, districtId, companyId, pincode });
        await block.save();
        res.status(201).send(block);
    } catch (error) {
        res.status(400).send(error);
    }
};

export const getStatesByCompany = async (req, res) => {
    try {
        // companyId is now reliably sourced from the authenticated user's token
        const companyId = req.user.companyId;
        console.log("Fetching states for companyId:", companyId);
        const states = await State.find({ companyId: companyId });

        if (!states || states.length === 0) {
            return res.status(404).json({ message: 'No states found for this company.' });
        }
        res.status(200).json(states);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching states', error: error.message });
    }
};

/**
 * @description Get all districts for the authenticated admin's company
 * @route GET /api/locations/districts
 */
export const getDistrictsByCompany = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const districts = await District.find({ companyId: companyId })
            .populate('stateId', 'name'); // Populates the state's name

        if (!districts || districts.length === 0) {
            return res.status(404).json({ message: 'No districts found for this company.' });
        }
        res.status(200).json(districts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching districts', error: error.message });
    }
};

/**
 * @description Get all blocks for the authenticated admin's company
 * @route GET /api/locations/blocks
 */
export const getBlocksByCompany = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const blocks = await Block.find({ companyId: companyId })
            .populate({
                path: 'districtId',
                select: 'name stateId', // Select district name and its stateId
                populate: {
                    path: 'stateId',
                    select: 'name' // Further populate the state's name from the district
                }
            });

        if (!blocks || blocks.length === 0) {
            return res.status(404).json({ message: 'No blocks found for this company.' });
        }
        res.status(200).json(blocks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blocks', error: error.message });
    }
};
