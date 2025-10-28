import express from "express";
import { connectDB } from "./config/db";
import { config } from "./config/env";
import workflowRoutes from "./routers/workflowRoutes";
import cors from "cors";

const app = express();

app.use(cors());

// Middleware
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use("/api", workflowRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Workflow API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
