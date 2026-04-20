const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// Online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

function getOnlineUserIds() {
    return Array.from(onlineUsers.keys());
}

function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: [
                "http://localhost:5173",
                "https://campus-connect-smoky-eta.vercel.app",
            ],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("_id name username avatar");
            if (!user) return next(new Error("User not found"));

            socket.userId = user._id.toString();
            socket.userData = {
                _id: user._id,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
            };
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const uid = socket.userId;
        console.log(`⚡ User connected: ${socket.userData.username} (${uid})`);

        // Track online user
        if (!onlineUsers.has(uid)) {
            onlineUsers.set(uid, new Set());
        }
        onlineUsers.get(uid).add(socket.id);

        // Broadcast updated online list
        io.emit("users:online", getOnlineUserIds());

        // Send current online list to the newly connected client
        socket.emit("users:online", getOnlineUserIds());

        socket.on("disconnect", () => {
            console.log(`💤 User disconnected: ${socket.userData.username}`);
            const userSockets = onlineUsers.get(uid);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(uid);
                }
            }
            io.emit("users:online", getOnlineUserIds());
        });
    });

    return io;
}

module.exports = { initSocket, getOnlineUserIds };
