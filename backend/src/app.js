import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load models
import "./models/User.js";
import "./models/State.js";
import "./models/District.js";
// import "./models/School.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/admin", adminRoutes);
app.use("/api/v1", userRoutes);

// DB Connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connection successful");

    await sequelize.sync({ alter: false });
    console.log("✅ Database synced");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
