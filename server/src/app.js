const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middlewares
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://campus-connect-smoky-eta.vercel.app",
        ],
        credentials: true,
    })
);

// Increase body limit for media uploads (base64 → Cloudinary)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Base route
app.get("/", (req, res) => {
    res.send("CampusConnect API is running...");
});

module.exports = app;