import School from '../models/School.js';
import Trade from '../models/Trade.js';
import Trainer from '../models/Trainer.js';
import SchoolTrade from '../models/SchoolTrade.js';

// --- School Management ---

/**
 * @description Create a new school for the admin's company
 * @route POST /api/management/schools
 */
export const createSchool = async (req, res) => {
    console.log("Request to create school received");
    try {
        const {name,location, blockId } = req.body;
        console.log("Creating school with data:", req.body);
         
        const companyId = req.user.companyId; // From auth middleware
       
        const school = new School({ name, location, blockId, companyId });
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
    const { schoolId, tradeId, fullName, email, phone, password, status ,uid } = req.body;
    const companyId = req.user.companyId; // from middleware

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
      tradeId,
      fullName,
      email,
      phone,
      password,
      status,
      uid
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
    const trainer = await Trainer.findOne({ email });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found." });
    }
    if (trainer.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const trainerResponse = { ...trainer.toObject() };
    delete trainerResponse.password; // ✅ correct field to hide
    res.status(200).json({
      message: "Login successful",
      user: trainerResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};