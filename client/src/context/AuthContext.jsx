import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verify saved token with backend on app start
    useEffect(() => {
        const verifyUser = async () => {
            const savedToken = localStorage.getItem("campusconnect_token");

            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");

                if (response.data.success) {
                    setAuthUser(response.data.user);
                    setAuthToken(savedToken);
                    localStorage.setItem(
                        "campusconnect_user",
                        JSON.stringify(response.data.user)
                    );
                }
            } catch (error) {
                localStorage.removeItem("campusconnect_user");
                localStorage.removeItem("campusconnect_token");
                setAuthUser(null);
                setAuthToken(null);
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    // Save login data
    const login = (user, token) => {
        setAuthUser(user);
        setAuthToken(token);

        localStorage.setItem("campusconnect_user", JSON.stringify(user));
        localStorage.setItem("campusconnect_token", token);
    };

    // Update current user data after profile edit
    const updateAuthUser = (updatedUser) => {
        setAuthUser(updatedUser);
        localStorage.setItem("campusconnect_user", JSON.stringify(updatedUser));
    };

    // Clear login data
    const logout = () => {
        setAuthUser(null);
        setAuthToken(null);

        localStorage.removeItem("campusconnect_user");
        localStorage.removeItem("campusconnect_token");
    };

    return (
        <AuthContext.Provider
            value={{
                authUser,
                authToken,
                loading,
                login,
                logout,
                updateAuthUser,
                isAuthenticated: !!authToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);