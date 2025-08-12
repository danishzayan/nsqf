import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password });

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // const user = await User.findOne({ where: { email } });
    const user = await User.findOne({
  where: { email, isActive: true }
});
if (!user || !user.isActive) {
  return res.status(404).json({ message: "User not found or inactive" });
}

    if(password=== user.password) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


