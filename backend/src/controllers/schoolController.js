import School from '../models/School.js';
import Trade from '../models/Trade.js';
import Trainer from '../models/Trainer.js';
import SchoolTrade from '../models/SchoolTrade.js';
import Block from '../models/Block.js';
import District from '../models/District.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// --- School Management ---


const generateToken = (id, companyId) => {
    return jwt.sign({ id, companyId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
}
/**
 * @description Create a new school for the admin's company
 * @route POST /api/management/schools
 */
export const createSchool = async (req, res) => {
    console.log("Request to create school received");
    try {
        const {name,location, blockId,uid,address,tradeId } = req.body;
        console.log("Creating school with data:", req.body);
         
        const companyId = req.user.companyId; // From auth middleware
       
        const school = new School({ name, location, blockId,uid, companyId ,address,tradeId});
        await school.save();
        res.status(201).json(school);
    } catch (error) {
        res.status(500).json({ message: 'Error creating school', error: error.message });
    }
};

/**
 * @description Get all schools for the admin's company
 * @route GET /api/management/schools
 */
export const getSchoolsByCompany = async (req, res) => {
    try {
        const companyId = req.user.companyId; // From auth middleware
        const schools = await School.find({ companyId })
            .populate('blockId', 'name')
            .populate('trades', 'name category');
        res.status(200).json(schools);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schools', error: error.message });
    }
};

// --- Trade Management ---

/**
 * @description Create a new trade (typically by a SuperAdmin, but open for now)
 * @route POST /api/management/trades
 */
export const createTrade = async (req, res) => {
  try {
    const trades = req.body; // expecting an array of trades

    if (!Array.isArray(trades) || trades.length === 0) {
      return res.status(400).json({ message: "Please provide an array of trades." });
    }

    // Check for duplicates in DB
    const existingNames = await Trade.find({
      name: { $in: trades.map((t) => t.name) },
    }).select("name");

    if (existingNames.length > 0) {
      return res.status(400).json({
        message: "Some trades already exist.",
        existing: existingNames.map((t) => t.name),
      });
    }

    // Insert multiple trades
    const newTrades = await Trade.insertMany(trades);

    res.status(201).json({
      message: "Trades created successfully.",
      trades: newTrades,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating trades", error: error.message });
  }
};

/**
 * @description Get all available trades
 * @route GET /api/management/trades
 */
export const getAllTrades = async (req, res) => {
    try {
        const trades = await Trade.find({});
        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trades', error: error.message });
    }
};
export const searchAllTrades = async (req, res) => {
  try {
    const { search } = req.query; // get search query from URL
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },      // case-insensitive name match
          { category: { $regex: search, $options: "i" } }   // case-insensitive category match
        ]
      };
    }

    const trades = await Trade.find(filter);

    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trades", error: error.message });
  }
};

/**
 * @description Assign a Trade to a School
 * @route POST /api/management/schools/assign-trade
 */
export const assignTradeToSchool = async (req, res) => {
    try {
        const { schoolId, tradeId } = req.body;
        const companyId = req.user.companyId;

        // Verify the school belongs to the admin's company
        const school = await School.findOne({ _id: schoolId, companyId });
        if (!school) {
            return res.status(404).json({ message: "School not found or doesn't belong to your company." });
        }

        // Create the link in the SchoolTrade collection
        const newSchoolTrade = new SchoolTrade({ schoolId, tradeId });
        await newSchoolTrade.save();

        // Add the trade to the school's 'trades' array for easy lookup
        school.trades.push(tradeId);
        await school.save();

        res.status(200).json({ message: 'Trade assigned successfully', school });
    } catch (error) {
        if (error.code === 11000) { // Handle duplicate key error
            return res.status(400).json({ message: 'This trade is already assigned to this school.' });
        }
        res.status(500).json({ message: 'Error assigning trade', error: error.message });
    }
};

// --- Trainer Management ---

/**
 * @description Create a new trainer for the admin's company
 * @route POST /api/management/trainers
 */
export const createTrainer = async (req, res) => {
  try {
    const { schoolId,location, tradeId, fullName, email, phone, password, status  } = req.body;
    const companyId = req.user.companyId; // from middleware
   console.log(req.body);
    // Verify the school belongs to the admin's company
    const school = await School.findOne({ _id: schoolId, companyId });
    if (!school) {
      return res
        .status(404)
        .json({ message: "School not found or doesn't belong to your company." });
    }

    const trainer = new Trainer({
      companyId,  // ✅ include companyId
      schoolId,
      location,
      tradeId,
      fullName,
      email,
      phone,
      password,
      status,
      // uid
    });

    await trainer.save();

    const trainerResponse = { ...trainer.toObject() };
    delete trainerResponse.password; // ✅ correct field to hide

    res.status(201).json(trainerResponse);
  } catch (error) {
    res.status(500).json({ message: "Error creating trainer", error: error.message });
  }
};
  

export const loginTrainer = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the trainer by email and populate the referenced fields
        const trainer = await Trainer.findOne({ email })
            .populate('companyId', 'name') // Fetches the Company and selects only its 'name' field
            .populate('schoolId', 'name ') // Fetches the School and selects 'name' and 'address'
            .populate('tradeId', 'name ');  // Fetches the Trade and selects 'name' and 'category'

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found." });
        }
        if (trainer.password !== password) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // The trainer object now contains the full details for the populated fields
        const trainerResponse = { ...trainer.toObject() };
        
        // The token payload should still use the raw IDs
        const token = generateToken(trainer._id, trainer.companyId._id); // Use trainer.companyId._id
        
        delete trainerResponse.password;
        
        res.status(200).json({
            message: "Login successful",
            user: trainerResponse,
            token,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};



export const createSchoolWithMultipleTrainers = async (req, res) => {
    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, location, blockId, uid, address, trainers } = req.body;
        const companyId = req.user.companyId;

        // Basic validation
        if (!trainers || trainers.length === 0) {
            throw new Error("At least one trainer is required to create a school.");
        }

        // STEP 1: Extract all unique trade IDs from the incoming trainers array.
        // Using a Set automatically handles duplicates.
        const tradeIds = [...new Set(trainers.map(trainer => trainer.tradeId))];
         console.log("Unique Trade IDs:", tradeIds);
        // STEP 2: Create the school document with the collected trade IDs.
        const school = new School({
            name,
            location,
            blockId,
            uid,
            address,
            companyId,
            tradeIds // Assign the array of trade IDs
        });
        const savedSchool = await school.save({ session });
        const schoolId = savedSchool._id; // Get the ID for the trainers

        // STEP 3: Prepare the trainer documents.
        // Add the new schoolId and the companyId to each trainer object.
        const trainersToCreate = trainers.map(trainer => ({
            ...trainer,
            schoolId: schoolId, // Link to the newly created school
            companyId: companyId,
            // location: location // Assuming trainers are at the school's location
        }));

        // STEP 4: Insert all trainer documents in a single, efficient operation.
        const savedTrainers = await Trainer.insertMany(trainersToCreate, { session });

        // If we reach here, both school and trainers were saved successfully.
        // Commit the transaction to make the changes permanent.
        await session.commitTransaction();

        res.status(201).json({
            message: "School and all trainers created successfully!",
            school: savedSchool,
            trainers: savedTrainers,
        });

    } catch (error) {
        // If any error occurred at any step, abort the entire transaction.
        // No changes will be saved to the database.
        await session.abortTransaction();
        res.status(500).json({ message: 'Transaction failed', error: error.message });
    } finally {
        // Always end the session.
        session.endSession();
    }
};

export const getSchoolsWithDetails = async (req, res) => {
    try {
        // 1. Get all possible IDs from the request query
        const { blockId, districtId, stateId } = req.query;
        const { companyId } = req.user;

        // Validate that at least one ID is provided
        if (!blockId && !districtId && !stateId) {
            return res.status(400).json({ message: 'Please provide a blockId, districtId, or stateId.' });
        }
        
        if (!companyId) {
            return res.status(401).json({ message: 'Company ID not found. User may not be authenticated.' });
        }

        // 2. Dynamically build the initial match query
        const matchQuery = {
            companyId: new mongoose.Types.ObjectId(companyId)
        };

        if (blockId) {
            // Easiest case: we have the blockId directly
            matchQuery.blockId = new mongoose.Types.ObjectId(blockId);
        } else if (districtId) {
            // Find all blocks belonging to the given district
            const blocksInDistrict = await Block.find({ districtId: new mongoose.Types.ObjectId(districtId) }).select('_id');
            const blockIds = blocksInDistrict.map(b => b._id);
            
            // If no blocks are found in the district, no schools can match
            if (blockIds.length === 0) return res.status(200).json([]);

            matchQuery.blockId = { $in: blockIds };
        } else if (stateId) {
            // Find all districts belonging to the given state
            const districtsInState = await District.find({ stateId: new mongoose.Types.ObjectId(stateId) }).select('_id');
            const districtIds = districtsInState.map(d => d._id);
            
            if (districtIds.length === 0) return res.status(200).json([]);

            // Now find all blocks within those districts
            const blocksInState = await Block.find({ districtId: { $in: districtIds } }).select('_id');
            const blockIds = blocksInState.map(b => b._id);

            if (blockIds.length === 0) return res.status(200).json([]);

            matchQuery.blockId = { $in: blockIds };
        }

        // 3. Define the main Aggregation Pipeline
        // The first stage is our dynamically created matchQuery
        const pipeline = [
            { $match: matchQuery },

            // All subsequent stages for joining and shaping data remain the same
            {
                $lookup: {
                    from: 'blocks',
                    localField: 'blockId',
                    foreignField: '_id',
                    as: 'block'
                }
            },
            { $unwind: { path: '$block', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'districts',
                    localField: 'block.districtId',
                    foreignField: '_id',
                    as: 'district'
                }
            },
            { $unwind: { path: '$district', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'states',
                    localField: 'district.stateId',
                    foreignField: '_id',
                    as: 'state'
                }
            },
            { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'trainers',
                    let: { schoolId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$schoolId', '$$schoolId'] } } },
                        { $lookup: { from: 'trades', localField: 'tradeId', foreignField: '_id', as: 'tradeInfo' } },
                        { $unwind: { path: '$tradeInfo', preserveNullAndEmptyArrays: true } },
                        { $project: { _id: 1, fullName: 1, email: 1, phone: 1, tradeName: '$tradeInfo.name' } }
                    ],
                    as: 'trainers'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    uid: 1,
                    address: 1,
                    location: 1,
                    blockName: '$block.name',
                    districtName: '$district.name',
                    stateName: '$state.name',
                    trainers: 1
                }
            }
        ];

        // 4. Execute the pipeline
        const schools = await School.aggregate(pipeline);
        
        // Return 404 only if schools are not found after a valid search
        if (!schools || schools.length === 0) {
            return res.status(404).json({ message: 'No schools found for the given criteria.' });
        }
        res.status(200).json(schools);

    } catch (error) {
        console.error('Error fetching school details:', error);
        res.status(500).json({ message: 'Error fetching school details', error: error.message });
    }
};
