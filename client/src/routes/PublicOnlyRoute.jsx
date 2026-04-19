import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-xl">Checking authentication...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/feed" replace />;
    }

    return children;
}

export default PublicOnlyRoute;