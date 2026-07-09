const http = require("http");
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    const httpServer = http.createServer(app);


    const io = initSocket(httpServer);


    app.set("io", io);

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Socket.IO ready`);
    });
});