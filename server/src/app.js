const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

// Middlewares
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://YOUR-VERCEL-DOMAIN.vercel.app",
        ],
        credentials: true,
    })
);

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