import SuperAdmin from '../models/SuperAdmin.js';
import Company from '../models/Company.js'; // Assuming SuperAdmin can view all companies

// --- SuperAdmin Controllers ---

/**
 * @description Create a new SuperAdmin
 * @route POST /api/superadmins
 */
export const createSuperAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if a superadmin already exists
        const existingSuperAdmin = await SuperAdmin.findOne({ $or: [{ email }, { username }] });
        if (existingSuperAdmin) {
            return res.status(400).json({ message: 'SuperAdmin with this email or username already exists.' });
        }

        const superAdmin = new SuperAdmin({ username, email, password });
        await superAdmin.save();

        // Avoid sending the password back in the response
        const userResponse = { ...superAdmin.toObject() };
        delete userResponse.password;

        res.status(201).json({ message: 'SuperAdmin created successfully', user: userResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating SuperAdmin', error: error.message });
    }
};

/**
 * @description Login for SuperAdmin
 * @route POST /api/superadmins/login
 */
export const loginSuperAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const superAdmin = await SuperAdmin.findOne({ email });

        if (!superAdmin) {
            return res.status(404).json({ message: 'SuperAdmin not found.' });
        }

        // IMPORTANT: Plain text password comparison (as requested, not secure)
        if (superAdmin.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // In a real app, you would generate a token (like JWT) here.
        // For now, we'll just return a success message.
        const userResponse = { ...superAdmin.toObject() };
        delete userResponse.password;


        res.status(200).json({
            message: 'Login successful',
            // token: 'dummy-token-for-superadmin', // Placeholder for a real token
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

/**
 * @description Get all companies (a SuperAdmin function)
 * @route GET /api/superadmins/companies
 */
export const viewAllCompanies = async (req, res) => {
    try {
        // Here you might add middleware to check if the user is a logged-in SuperAdmin
        const companies = await Company.find({});
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching companies', error: error.message });
    }
};
