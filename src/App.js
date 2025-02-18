const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Seu frontend
    credentials: true,
  })
); // Middleware para JSON
app.use(express.json());

// Rotas
app.use("/files/", fileRoutes);
app.use("/users", userRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
