const express = require("express");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const financeRoutes = require("./src/routes/financeRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");
const allowedOrigins = (process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

connectDB();

app.use((req, res, next) => {
  const origin = req.headers.origin ? normalizeOrigin(req.headers.origin) : "";

  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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
