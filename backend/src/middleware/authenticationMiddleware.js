import jwt from 'jsonwebtoken';
import CompanyAdmin from '../models/CompanyAdmin.js';

/**
 * @description Middleware to protect routes that require CompanyAdmin authentication.
 * It verifies the JWT and attaches the user's data to the request object.
 */
export const protectCompanyAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request object
            // We find the user but exclude the password
            req.user = await CompanyAdmin.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // The decoded token payload already has companyId, but fetching the user ensures they still exist.
            // For extra security, we can use the companyId from the fresh user object.
            req.user.companyId = decoded.companyId;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
