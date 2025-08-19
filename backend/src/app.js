// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";

// Load models
import "./models/User.js";
import "./models/State.js";
import "./models/District.js";
// import "./models/School.js";

// Load routes
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount routes
app.use("/api/admin", adminRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/attendance", attendanceRoutes);

// Async server startup
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connection successful");

    await sequelize.sync({ alter: false });
    console.log("✅ Database synced");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();

// Catch unhandled rejections & exceptions
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
