const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit");
const path = require("path");

// Improve error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// Load environment variables
dotenv.config();

// Import routes
const jobRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
const interviewRoutes = require("./routes/interviews");
const codeRoutes = require("./routes/code");
const { mockJobs } = require("./utils/mockData");

// Import all models
require("./models/User");
require("./models/Job");
require("./models/Interview");
require("./models/Question");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Set trust proxy to true since we're behind Nginx
app.set('trust proxy', 1);

// Production security middleware
if (isProduction) {
  app.use(
    helmet({
      contentSecurityPolicy: false, 
    })
  );

  // Implement rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: "Too many requests, please try again later",
    })
  );
}

// Add additional security headers in production
if (isProduction) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          imgSrc: ["'self'", "data:", "https://cdn.example.com"],
          connectSrc: [
            "'self'",
            "https://api.judge0.com",
            "https://generativelanguage.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: "same-origin" },
    })
  );
}

// CORS configuration with production domains
app.use(
  cors({
    origin: true, // This will echo the Origin header back without modification
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enhanced MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: isProduction ? 30 : 10, 
  })
  .then(() =>
    console.log(
      `Connected to MongoDB (${isProduction ? "production" : "development"})`
    )
  )
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if unable to connect to MongoDB
  });

// Routes

// Simple mock data API route
app.get("/api/jobs/mock", (req, res) => {
  res.json(mockJobs);
});

app.get("/api/jobs/mock/:id", (req, res) => {
  const job = mockJobs.find((job) => job._id === req.params.id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: "Mock job not found" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    environment: isProduction ? "production" : "development",
    timestamp: new Date().toISOString(),
  });
});

// Register other routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/code", codeRoutes);

// In production, serve the frontend from the built files
if (isProduction) {
  // Remove static file serving since frontend will be on Vercel
  // Just keep API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.status(404).json({ message: "Not found - API only server" });
    }
  });
} else {
  // Basic route for testing in development
  app.get("/", (req, res) => {
    res.send("JobsForce API is running in development mode");
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: isProduction ? undefined : err.message,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      isProduction ? "production" : "development"
    } mode`
  );
  console.log(
    `API available at ${
      isProduction ? "https://3.92.223.195/api" : `http://localhost:${PORT}/api`
    }`
  );
});
