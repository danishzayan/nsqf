import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
// import companyRoutes from './routes/CompanyRoutes.js';
import superadminRoutes from './routes/SuperAdminRoutes.js';
import companyAdminRoutes from './routes/CompanyAdminRoutes.js';
import managementRoutes from './routes/managementRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import dotenv from "dotenv";
dotenv.config();
// Import routes
// import tradeRoutes from "./routes/tradeRoutes.js";

// Initialize express app

const app = express();

app.use(express.json()); // parses application/json
app.use(express.urlencoded({ extended: true })); // parses form-data (optional)

// Connect to MongoDB
 await connectDB();
// Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies


// API Routes
// Define Routes
// app.use('/api', companyRoutes);
app.use('/api/superadmins', superadminRoutes);
app.use('/api/companyadmins', companyAdminRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/trainers', trainerRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount the trade routes
// app.use("/api/trades", tradeRoutes);

export default app;
