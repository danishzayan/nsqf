import CompanyAdmin from '../models/CompanyAdmin.js';
import State from '../models/State.js';
import District from '../models/District.js';
import Block from '../models/Block.js';
import StateCoordinator from '../models/StateLevelVc.js'; // Make sure the path to your model is correct
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

  export const   generateToken = (id, companyId) => {
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
        console.log(error)
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

export const getAllByCompany = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        const stateWiseDistribution = await State.aggregate([
            // Stage 1: Find states for the company.
            {
                $match: { companyId: new mongoose.Types.ObjectId(companyId) }
            },
            
            // Stage 2: Look up districts in those states.
            {
                $lookup: {
                    from: 'districts',
                    localField: '_id',
                    foreignField: 'stateId',
                    as: 'districts'
                }
            },
            
            // Stage 3: Look up blocks in those districts.
            {
                $lookup: {
                    from: 'blocks',
                    localField: 'districts._id',
                    foreignField: 'districtId',
                    as: 'blocks'
                }
            },

            // Stage 4: Look up schools in those blocks.
            {
                $lookup: {
                    from: 'schools',
                    localField: 'blocks._id',
                    foreignField: 'blockId',
                    as: 'schools'
                }
            },

            // NEW - Stage 5: Look up all trainers belonging to the schools we just found.
            {
                $lookup: {
                    from: 'trainers', // The collection name for your Trainer model
                    localField: 'schools._id',
                    foreignField: 'schoolId',
                    as: 'trainers'
                }
            },

            // Stage 6: Create new fields for all counts.
            {
                $addFields: {
                    districtCount: { $size: '$districts' },
                    blockCount: { $size: '$blocks' },
                    schoolCount: { $size: '$schools' },
                    tradeCount: {
                        $sum: {
                            $map: {
                                input: "$schools",
                                as: "school",
                                in: { $size: "$$school.trades" }
                            }
                        }
                    },
                    trainerCount: { $size: '$trainers' } // NEW: Count the trainers found
                }
            },

            // Stage 7: Project only the fields we need.
            {
                $project: {
                    _id: 1,
                    name: 1,
                    districtCount: 1,
                    blockCount: 1,
                    schoolCount: 1,
                    tradeCount: 1,
                    trainerCount: 1, // NEW: Include trainerCount in the final output
                }
            },
            
            // Stage 8: Sort by state name.
            {
                $sort: { name: 1 }
            }
        ]);

        if (!stateWiseDistribution || stateWiseDistribution.length === 0) {
            return res.status(404).json({ message: 'No state-wise data found for this company.' });
        }
        
        res.status(200).json(stateWiseDistribution);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching state-wise distribution', error: error.message });
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

/**
 * @desc    Register a new State Coordinator
 * @route   POST /api/coordinators/register
 * @access  Private (e.g., Admin access)
 * @body    { personalInfo, loginCredentials, companyId }
 */
export const registerStateCoordinator = async (req, res) => {
    try {
        // 1. Destructure the required information from the request body.
        const { personalInfo, loginCredentials } = req.body;
        const { companyId } = req.user; // Ensure companyId is provided
        // 2. Basic validation: Check if essential data is provided.
        if (!personalInfo || !loginCredentials || !companyId) {
            return res.status(400).json({ message: 'Please provide personalInfo, loginCredentials, and companyId.' });
        }
        if (!personalInfo.email || !loginCredentials.password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 3. Prevent duplicates: Check if a coordinator with the same email already exists.
        const coordinatorExists = await StateCoordinator.findOne({ 'personalInfo.email': personalInfo.email });
        if (coordinatorExists) {
            return res.status(409).json({ message: 'A coordinator with this email already exists.' });
        }

        // 4. Create a new coordinator instance with the validated data.
        //    Note: stateId and managedTrainers are not included at this stage.
        const newCoordinator = new StateCoordinator({
            personalInfo,
            loginCredentials,
            companyId
        });

        // 5. Save the new coordinator to the database.
        const savedCoordinator = await newCoordinator.save();

        // 6. Send a success response.
        res.status(201).json({
            message: 'State Coordinator registered successfully. You can now assign a state and trainers.',
            data: savedCoordinator
        });

    } catch (error) {
        // 7. Handle any server-side errors.
        console.error('Error during State Coordinator registration:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};
/**
 * @desc    Assign or update trainers and schools for a State Coordinator.
 * @route   PUT /api/coordinators/:coordinatorId/assign
 * @access  Private (e.g., Admin)
 * @param   {string} coordinatorId - The MongoDB ObjectId of the State Coordinator from the URL.
 * @body    {string[]} [trainerIds] - Optional. An array of trainer ObjectIds to assign.
 * @body    {string[]} [schoolIds] - Optional. An array of school ObjectIds to assign.
 */
export const assignToCoordinator = async (req, res) => {
    const { coordinatorId } = req.params;
    const { trainerIds, schoolIds } = req.body;

    // 1. Input Validation: Check if the provided ID is a valid MongoDB ObjectId format.
    if (!mongoose.Types.ObjectId.isValid(coordinatorId)) {
        return res.status(400).json({ message: 'Invalid State Coordinator ID format.' });
    }

    // A transaction ensures that all database operations succeed, or they all fail together.
    // This prevents partial updates and keeps your data consistent.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Find the State Coordinator to be updated.
        const coordinator = await StateCoordinator.findById(coordinatorId).session(session);
        if (!coordinator) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'State Coordinator not found.' });
        }

        // 3. Clean up old assignments (Good Practice):
        // Before assigning new trainers, remove the coordinator link from any trainers they previously managed.
        // This prevents "orphaned" links in your data.
        await Trainer.updateMany(
            { _id: { $in: coordinator.managedTrainers } },
            { $unset: { coordinatorId: "" } }, // The $unset operator removes the field.
            { session }
        );

        // 4. Update the coordinator's document:
        // Assign the new arrays from the request body. If an array is not provided,
        // the existing data for that field will be preserved.
        if (trainerIds) {
            coordinator.managedTrainers = trainerIds;
        }
        if (schoolIds) {
            coordinator.assignedSchools = schoolIds;
        }
        
        const updatedCoordinator = await coordinator.save({ session });

        // 5. Create the new two-way link:
        // Update the newly assigned trainers to point back to this coordinator.
        if (trainerIds && trainerIds.length > 0) {
            await Trainer.updateMany(
                { _id: { $in: trainerIds } },
                { $set: { coordinatorId: updatedCoordinator._id } },
                { session }
            );
        }

        // 6. Commit the transaction if all database operations were successful.
        await session.commitTransaction();

        res.status(200).json({
            message: 'Assignments for State Coordinator updated successfully.',
            data: updatedCoordinator
        });

    } catch (error) {
        // 7. If any operation fails, roll back all changes made during the transaction.
        await session.abortTransaction();
        console.error('Error during assignment transaction:', error);
        res.status(500).json({ message: 'An error occurred during the assignment process.', error: error.message });
    } finally {
        // 8. Always end the session to release its resources.
        session.endSession();
    }
};

export const searchStateCoordinators = async (req, res) => {
    try {
        // --- 1. Build the Search Query Object ---
        const query = {};
        const { name, email, stateId } = req.query;
        const { companyId } = req.user; // Get companyId from auth middleware

        // All searches are now automatically scoped by the user's companyId
        if (companyId) {
            query.companyId = companyId;
        } else {
            // If for some reason a user without a companyId makes a request
            return res.status(403).json({ message: 'Access Denied: No company association found.' });
        }

        if (name) {
            // Use a regular expression for partial, case-insensitive matching
            query['personalInfo.name'] = { $regex: name, $options: 'i' };
        }
        if (email) {
            query['personalInfo.email'] = { $regex: email, $options: 'i' };
        }
        if (stateId) {
            // Ensure it's a valid ObjectId before adding to the query
            if (mongoose.Types.ObjectId.isValid(stateId)) {
                query.stateId = stateId;
            }
        }

        // --- 2. Setup Pagination ---
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // --- 3. Execute the Search Query ---
        const coordinators = await StateCoordinator.find(query)
            .populate('stateId', 'name') // Populate state name
            .populate('managedTrainers', 'fullName email') // Populate basic trainer info
            .populate('assignedSchools', 'name') // Populate school names
            .sort({ createdAt: -1 }) // Sort by most recently created
            .skip(skip)
            .limit(limit)
            .lean(); // Use .lean() for faster read-only operations

        // --- 4. Get Total Count for Pagination ---
        const totalResults = await StateCoordinator.countDocuments(query);
        const totalPages = Math.ceil(totalResults / limit);

        // --- 5. Send the Response ---
        res.status(200).json({
            message: 'Search successful.',
            data: coordinators,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                limit
            }
        });

    } catch (error) {
        console.error('Error searching for State Coordinators:', error);
        res.status(500).json({ message: 'Server error during search.', error: error.message });
    }
};



/**
 * @desc    Get all trainers managed by the logged-in State Coordinator.
 * @route   GET /api/coordinators/my-trainers
 * @access  Private (StateCoordinator)
 * @query   page - The page number for pagination (default: 1).
 * @query   limit - The number of results per page (default: 10).
 */
export const getManagedTrainers = async (req, res) => {
    try {
        // 1. Get the logged-in State Coordinator's ID from the middleware
        const { id: coordinatorId } = req.user;

        // 2. Setup Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // 3. Find all trainers where `coordinatorId` matches the logged-in user's ID
        const trainers = await Trainer.find({ coordinatorId: coordinatorId })
            .populate('schoolId', 'name address') // Populate relevant school details
            .sort({ fullName: 1 }) // Sort trainers alphabetically by name
            .skip(skip)
            .limit(limit)
            .lean();

        // 4. Get the total count for pagination metadata
        const totalResults = await Trainer.countDocuments({ coordinatorId: coordinatorId });
        const totalPages = Math.ceil(totalResults / limit);

        // 5. Send the successful response
        res.status(200).json({
            message: 'Successfully retrieved managed trainers.',
            data: trainers,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                limit
            }
        });

    } catch (error) {
        console.error('Error retrieving managed trainers:', error);
        res.status(500).json({ message: 'Server error while retrieving trainers.', error: error.message });
    }
};

export const coordinatorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        // 2. Find the coordinator by email.
        // We must explicitly select the password because it is hidden by default in the model.
        const coordinator = await StateCoordinator.findOne({ 'personalInfo.email': email })
            .select('+loginCredentials.password');

        // 3. Check if the coordinator exists and if the password matches.
        if (coordinator && (await coordinator.matchPassword(password))) {
            // 4. Generate a token containing the user's ID, company ID, and role.
            const token = generateToken(
                coordinator._id,
                coordinator.companyId,
                'StateCoordinator' // Explicitly define the role
            );

            // 5. Send the successful response with the token.
            res.status(200).json({
                message: 'Login successful.',
                token: token,
                data: {
                    _id: coordinator._id,
                    name: coordinator.personalInfo.name,
                    email: coordinator.personalInfo.email,
                }
            });
        } else {
            // 6. If authentication fails, send a generic error to prevent user enumeration.
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during coordinator login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};