import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { authUser, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                {/* Logo / Brand */}
                <Link to={isAuthenticated ? "/feed" : "/"} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 text-black flex items-center justify-center font-bold text-lg shadow-lg">
                        C
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none">CampusConnect</h1>
                        <p className="text-zinc-500 text-xs mt-1">Student Social Platform</p>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/feed"
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${isActive("/feed")
                                        ? "bg-orange-500 text-black"
                                        : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                                    }`}
                            >
                                Feed
                            </Link>

                            <Link
                                to="/profile"
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${isActive("/profile")
                                        ? "bg-orange-500 text-black"
                                        : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                                    }`}
                            >
                                Profile
                            </Link>

                            <div className="hidden md:flex items-center px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-sm">
                                @{authUser?.username || "user"}
                            </div>

                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-sm font-semibold transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${isActive("/login")
                                        ? "bg-orange-500 text-black"
                                        : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                                    }`}
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-sm font-semibold transition"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;