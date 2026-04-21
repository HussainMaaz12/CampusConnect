import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import App from "./App.jsx";
import "./index.css";
import "./styles/theme.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <GoogleOAuthProvider clientId="314697397878-21j20tee42raa4o9gi18aj79onenin7d.apps.googleusercontent.com">
            <AuthProvider>
                <ThemeProvider>
                    <SocketProvider>
                        <App />
                    </SocketProvider>
                </ThemeProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    </StrictMode>
);