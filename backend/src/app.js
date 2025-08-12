import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import adminRoutes from "./routes/admin.routes.js";
import "./models/User.js";     // Load models
import "./models/State.js";
import "./models/District.js";
import "./models/School.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);

// DB Connection
sequelize.sync({ alter: true }) // alter for dev; use { force: false } in prod
  .then(() => console.log("✅ Database synced"))
  .catch(err => console.error("❌ DB sync error:", err));

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
