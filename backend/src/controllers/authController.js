import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
   console.log("Logging in user:", { email , password });
    // const user = await User.findOne({ where: { email } });
    const user = await User.findOne({
  where: { email, isActive: true }
});
console.log("password", user.dataValues.password);
console.log("user", user);

if (!user || !user.isActive) {
  return res.status(404).json({ message: "User not found or inactive" });
}

    if(password !== user.dataValues.password) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    

    const token = jwt.sign({ id: user.dataValues.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "server error" });
  }
};


