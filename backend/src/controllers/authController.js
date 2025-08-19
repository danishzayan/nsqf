import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { Op } from "sequelize";
export const register = async (req, res) => {
  try {
    const { name, email, password,phone,role } = req.body;
    console.log("Registering user:", { name, email , phone, role });
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password ,phone, role });

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Logging in user:", { email, password });

    const user = await User.findOne({
      where: { email, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

    if (password !== user.dataValues.password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Add role to payload
    const token = jwt.sign(
      { id: user.dataValues.id, role: user.dataValues.role }, // role included
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.dataValues.role // also return role explicitly
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "server error" });
  }
};

 export const searchTrainers = async (req, res) => {
  try {
    const { name } = req.query; // e.g. ?name=trainerName
    console.log("Searching trainers with name:", name);

    let whereCondition = {
      role: "trainer", // ✅ filter only trainers
    };

    if (name) {
      whereCondition.name = {
        [Op.like]: `%${name}%`, // partial match
      };
    }

    const trainers = await User.findAll({
      where: whereCondition,
      attributes: ["id", "name"], // return id & name
    });

    if (!trainers || trainers.length === 0) {
      return res.status(404).json({ message: "No trainers found" });
    }

    res.json({
      success: true,
      data: trainers,
    });
  } catch (error) {
    console.error("Error searching trainers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search trainers",
    });
  }
};
