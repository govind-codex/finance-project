const express = require("express");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const financeRoutes = require("./src/routes/financeRoutes");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const normalizeOrigin = (origin) => origin.replace(/\/+$|\s+/g, "");
const allowedOrigins = (process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

const isLocalhostOrigin = (origin) => /^https?:\/\/localhost(:\d+)?$/.test(origin);
const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins.includes(origin) || isLocalhostOrigin(origin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS origin not allowed"));
    }
  },
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

connectDB();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Finance project backend server is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
