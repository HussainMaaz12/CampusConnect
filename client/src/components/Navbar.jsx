import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { authUser, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `px-4 py-2 rounded-full text-sm font-medium transition border ${
            isActive(path)
                ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 border-fuchsia-300/40 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)]"
                : "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10"
        }`;

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                <Link to={isAuthenticated ? "/feed" : "/"} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-white flex items-center justify-center font-black text-lg shadow-[0_10px_30px_rgba(139,92,246,0.45)]">
                        CC
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none">CampusConnect</h1>
                        <p className="text-zinc-300/80 text-xs mt-1">for student creators + communities</p>
                    </div>
                </Link>

                <nav className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                    {isAuthenticated ? (
                        <>
                            <Link to="/feed" className={navLinkClass("/feed")}>
                                Feed
                            </Link>
                            <Link to="/profile" className={navLinkClass("/profile")}>
                                Profile
                            </Link>

                            <div className="hidden md:flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-200 text-sm">
                                @{authUser?.username || "user"}
                            </div>

                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-sm font-semibold transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={navLinkClass("/login")}>
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-95 transition shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                            >
                                Join Now
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
