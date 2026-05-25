import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import indexRoutes from "./routes/index.js";
import connectDB from "./config/db.js";
import { seedDepartmentTemplates } from "./config/seedTemplates.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));

// Database connection
connectDB();

// Seed department templates
seedDepartmentTemplates();

// Routes
app.use("/api", indexRoutes);

// Basic route
app.get("/", (req, res) => {
    res.json({ message: "SmartOrg AI Backend is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

export default app;