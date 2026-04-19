const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

// TEMPORARY: open CORS for competition/demo reliability
app.use(cors());

app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Base route
app.get("/", (req, res) => {
    res.send("CampusConnect API is running...");
});

module.exports = app;