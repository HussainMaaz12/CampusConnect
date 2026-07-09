const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");


const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();


const setupMasterAccount = async () => {
    try {
        
        const masterEmail = "[REDACTED_EMAIL]";
        const masterPassword = "[REDACTED_PASSWORD]";
        const masterUsername = "[REDACTED_USERNAME]";

        
        const existingMaster = await User.findOne({ email: masterEmail });

        if (!existingMaster) {
            
            const hashedPassword = await bcrypt.hash(masterPassword, 10);

            
            await User.create({
                name: "Master Developer",
                username: masterUsername,
                email: masterEmail,
                password: hashedPassword,
                role: "admin",
                canPost: true
            });
            console.log("Master Developer account generated successfully!");
        } else {
            
            existingMaster.role = "admin";
            existingMaster.canPost = true;
            await existingMaster.save();
            console.log("Master Developer account is ready and permissions verified.");
        }
    } catch (error) {
        console.error("Error setting up Master account:", error);
    }
};


setupMasterAccount();




app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://campus-connect-smoky-eta.vercel.app",
        ],
        credentials: true,
    })
);


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);


app.get("/", (req, res) => {
    res.send("CampusConnect API is running...");
});


app.use((req, res) => {
    res.status(404).json({ success: false, message: "API endpoint not found" });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;