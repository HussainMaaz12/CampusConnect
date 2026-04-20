import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
    const { authToken, isAuthenticated } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && authToken) {
            const socket = io(SOCKET_URL, {
                auth: { token: authToken },
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionAttempts: 10,
            });

            socket.on("connect", () => {
                console.log("⚡ Socket connected");
            });

            socket.on("users:online", (userIds) => {
                setOnlineUsers(userIds);
            });

            socket.on("disconnect", () => {
                console.log("💤 Socket disconnected");
            });

            socket.on("connect_error", (err) => {
                console.log("Socket auth error:", err.message);
            });

            socketRef.current = socket;

            return () => {
                socket.disconnect();
                socketRef.current = null;
            };
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setOnlineUsers([]);
        }
    }, [isAuthenticated, authToken]);

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                onlineUsers,
                isOnline: (userId) => onlineUsers.includes(userId),
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
