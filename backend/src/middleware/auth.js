import jwt from "jsonwebtoken";
import User from "../models/Trainer.js";

export default async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
      console.log("Token received:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    console.log("Decoded ID:", decoded.id);
    const user = await User.findById(decoded.id);
    console.log("User found:", user);
   console.log("Decoded user:", user);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user; // attach user object to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
}
