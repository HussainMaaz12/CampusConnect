const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const Sentry = require("@sentry/node");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
    });
}


const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");


const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();


const setupMasterAccount = async () => {
    try {
        const crypto = require('crypto');

        const masterEmail = process.env.MASTER_DEV_EMAIL || "admin@campusconnect.local";
        const masterUsername = process.env.MASTER_DEV_USERNAME || "admin";

        let masterPassword = process.env.MASTER_DEV_PASSWORD;
        let isGeneratedPassword = false;

        if (!masterPassword) {
            masterPassword = crypto.randomBytes(12).toString('hex');
            isGeneratedPassword = true;
        }


        const existingMaster = await User.findOne({ email: masterEmail });

        if (!existingMaster) {

            const hashedPassword = await bcrypt.hash(masterPassword, 10);


            await User.create({
                name: "Master Developer",
                username: masterUsername,
                email: masterEmail,
                password: hashedPassword,
                role: "super-admin",
                canPost: true
            });
            console.log("Master Developer account generated successfully!");
            if (isGeneratedPassword) {
                console.log("=================================================");
                console.log(`ATTENTION: Auto-generated Master Password: ${masterPassword}`);
                console.log("Please save this password securely. It will not be shown again.");
                console.log("=================================================");
            }
        } else {
            existingMaster.role = "super-admin";
            existingMaster.canPost = true;

            if (!isGeneratedPassword && process.env.MASTER_DEV_PASSWORD) {
                existingMaster.password = await bcrypt.hash(process.env.MASTER_DEV_PASSWORD, 10);
                console.log("Master Developer password synced with .env file.");
            }

            await existingMaster.save();
            console.log("Master Developer account is ready and permissions verified.");
        }
    } catch (error) {
        console.error("Error setting up Master account:", error);
    }
};

app.use(helmet());
app.use(cookieParser());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://campus-connect-smoky-eta.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}


app.use("/api/v1", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/report", reportRoutes);


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

app.use(notFound);
app.use(errorHandler);

module.exports = { app, setupMasterAccount };