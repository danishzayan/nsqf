import State from "../models/State.js";
import District from "../models/District.js";
import  City  from "../models/City.js";

// ✅ Add State
export const addState = async (req, res) => {
  try {
    // Role check
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can add states" });
    }

    const { name, code } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required" });
    }

    // Create
    const state = await State.create({ name, code });

    res.status(201).json({ message: "State added successfully", state });
  } catch (error) {
    res.status(500).json({ message: "Error adding state", error: error.message });
  }
};

// ✅ Add District
export const addDistrict = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can add districts" });
    }

    const { name, pincode, stateId } = req.body;

    if (!name || !pincode || !stateId) {
      return res.status(400).json({ message: "Name, pincode, and stateId are required" });
    }

    // Check if state exists
    const state = await State.findByPk(stateId);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    const district = await District.create({ name, pincode, stateId });

    res.status(201).json({ message: "District added successfully", district });
  } catch (error) {
    res.status(500).json({ message: "Error adding district", error: error.message });
  }
};

// ✅ Add City
export const addCity = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can add cities" });
    } 
    const { name, pincode, districtId } = req.body;

    if (!name || !pincode || !districtId) {
      return res.status(400).json({ message: "Name, pincode, and districtId are required" });
    } 
    // Check if district exists
    const district = await District.findByPk(districtId);
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }
    const city = await City.create({ name, pincode, districtId });

    res.status(201).json({ message: "City added successfully", city });
  } catch (error) {
    res.status(500).json({ message: "Error adding city", error: error.message });
  }
};

// ✅ Get all States
export const getAllStates = async (req, res) => {
  try {
    const states = await State.findAll();
    res.json(states);
  } catch (error) {
    res.status(500).json({ message: "Error fetching states", error: error.message });
  }
};
// ✅ Get all Districts