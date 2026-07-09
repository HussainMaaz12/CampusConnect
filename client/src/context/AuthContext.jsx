import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const verifyUser = async () => {
            try {
                
                const response = await api.post("/auth/refresh");

                if (response.data.success) {
                    setAccessToken(response.data.token);
                    setAuthToken(response.data.token);
                    
                    
                    const meRes = await api.get("/auth/me");
                    if (meRes.data.success) {
                        setAuthUser(meRes.data.user);
                    }
                }
            } catch (error) {
                
                setAuthUser(null);
                setAuthToken(null);
                setAccessToken(null);
                localStorage.removeItem("campusconnect_user");
            } finally {
                setLoading(false);
            }
        };

        verifyUser();

        const handleAuthExpired = () => {
            logout();
        };

        window.addEventListener('auth:expired', handleAuthExpired);
        return () => window.removeEventListener('auth:expired', handleAuthExpired);
    }, []);

    
    const login = (user, token) => {
        setAuthUser(user);
        setAuthToken(token);
        setAccessToken(token);

        localStorage.setItem("campusconnect_user", JSON.stringify(user));
    };

    
    const updateAuthUser = (updatedUser) => {
        setAuthUser(updatedUser);
        localStorage.setItem("campusconnect_user", JSON.stringify(updatedUser));
    };

    
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        
        setAuthUser(null);
        setAuthToken(null);
        setAccessToken(null);

        localStorage.removeItem("campusconnect_user");
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