require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const produtivityRoutes = require("./routes/produtivityRoutes");

const app = express();
console.log("MONGO_URI:", process.env.MONGO_URI);

app.use(express.json({ limit: process.env.JSON_LIMIT }));
app.use(express.urlencoded({ limit: process.env.JSON_LIMIT, extended: true }));

app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN_1, process.env.CLIENT_ORIGIN_2].filter(
      Boolean
    ),
    credentials: true,
  })
);

app.use(express.json());

// Rotas
app.use("/api", produtivityRoutes);
app.use("/files/", fileRoutes);
app.use("/users", userRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
