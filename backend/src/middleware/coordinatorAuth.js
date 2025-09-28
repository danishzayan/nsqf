import jwt from 'jsonwebtoken';
import StateCoordinator from '../models/StateLevelVc.js'; // Adjust path to your model

/**
 * @desc    Middleware to protect routes by verifying JWT.
 * It decodes the token and attaches the user object to the request.
 */
export const protect = async (req, res, next) => {
    let token;

    // 1. Check if the 'Authorization' header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract the token from the header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user from the database using the ID from the token's payload.
            //    We exclude the password from the user object that gets attached to the request.
            req.user = await StateCoordinator.findById(decoded.id).select('-loginCredentials.password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found.' });
            }

            // 5. Proceed to the next middleware or the route controller
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

/**
 * @desc    Middleware to check if the logged-in user has the 'StateCoordinator' role.
 * This should be used AFTER the 'protect' middleware.
 */
export const isCoordinator = (req, res, next) => {
    if (req.user && req.user.role === 'StateCoordinator') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Access is restricted to State Coordinators.' });
    }
};
