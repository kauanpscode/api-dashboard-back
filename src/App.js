const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const produtivityRoutes = require("./routes/produtivityRoutes");

const app = express();

app.use(express.json({ limit: "10mb" })); // Aumentando o limite do JSON
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Para formulários

app.use(
  cors({
    origin: "http://localhost:5173", // Seu frontends
    credentials: true,
  })
); // Middleware para JSON
app.use(express.json());

// Rotas
app.use("/api", produtivityRoutes);
app.use("/files/", fileRoutes);
app.use("/users", userRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
