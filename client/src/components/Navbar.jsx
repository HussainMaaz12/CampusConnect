import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { authUser, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const getInitial = (name) => (name || "U").charAt(0).toUpperCase();

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
                .navbar-root { font-family: 'DM Sans', sans-serif; }
                .nav-glass {
                    background: linear-gradient(180deg, rgba(12,12,12,0.94) 0%, rgba(10,10,10,0.90) 100%);
                    backdrop-filter: blur(30px) saturate(1.8);
                    -webkit-backdrop-filter: blur(30px) saturate(1.8);
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                }
                .nav-glow {
                    position: absolute;
                    bottom: -1px; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent 5%, rgba(249,115,22,0.4) 25%, rgba(168,85,247,0.3) 50%, rgba(59,130,246,0.2) 75%, transparent 95%);
                    opacity: 0.7;
                }
                .nav-link {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 18px; border-radius: 14px;
                    font-size: 14px; font-weight: 500;
                    transition: all 0.2s; position: relative;
                    color: rgba(255,255,255,0.35); text-decoration: none;
                    white-space: nowrap;
                }
                .nav-link:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.04); }
                .nav-link.active { color: #fb923c; background: rgba(249,115,22,0.08); }
                .nav-link.active::after {
                    content: ''; position: absolute;
                    bottom: -13px; left: 50%; transform: translateX(-50%);
                    width: 24px; height: 3px;
                    background: linear-gradient(90deg, #f97316, #fb923c);
                    border-radius: 2px;
                }
                .nav-avatar {
                    width: 34px; height: 34px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 13px; font-weight: 700;
                    background: linear-gradient(135deg, #f97316, #a855f7);
                    color: #000;
                    box-shadow: 0 0 0 2px rgba(249,115,22,0.15);
                    transition: all 0.2s;
                    overflow: hidden;
                }
                .nav-avatar:hover { box-shadow: 0 0 0 3px rgba(249,115,22,0.3); transform: scale(1.05); }
                .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .nav-logout {
                    padding: 8px 16px; border-radius: 12px;
                    font-size: 13px; font-weight: 600;
                    background: rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.35);
                    border: 1px solid rgba(255,255,255,0.06);
                    cursor: pointer; transition: all 0.2s;
                    white-space: nowrap;
                }
                .nav-logout:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.15); color: #f87171; }
                .nav-brand { font-family: 'Syne', sans-serif; }
            `}} />
            <header className="navbar-root sticky top-0 z-50 nav-glass">
                <div className="relative">
                    <div className="nav-glow" />
                    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
                        {/* Brand */}
                        <Link to={isAuthenticated ? "/feed" : "/"} className="flex items-center gap-2.5 group flex-shrink-0">
                            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-black flex items-center justify-center text-[11px] font-extrabold shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/35 transition-all duration-300 group-hover:scale-105">
                                CC
                            </div>
                            <span className="nav-brand text-white/90 font-bold text-[16px] tracking-tight hidden sm:inline">
                                Campus<span className="text-orange-400">Connect</span>
                            </span>
                        </Link>

                        {/* Center Nav */}
                        <nav className="flex items-center gap-1">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/feed" className={`nav-link ${isActive("/feed") ? "active" : ""}`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive("/feed") ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                        <span className="hidden sm:inline">Feed</span>
                                    </Link>
                                    <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive("/profile") ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span className="hidden sm:inline">Profile</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`}>Login</Link>
                                    <Link to="/register" className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-[13px] font-semibold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02]">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Right - User & Logout */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                                <Link to="/profile" className="flex items-center gap-2 group">
                                    <div className="nav-avatar">
                                        {authUser?.avatar ? (
                                            <img src={authUser.avatar} alt={authUser.name} />
                                        ) : (
                                            getInitial(authUser?.name)
                                        )}
                                    </div>
                                    <span className="text-white/35 text-[12px] font-medium hidden lg:inline group-hover:text-white/55 transition">
                                        @{authUser?.username || "user"}
                                    </span>
                                </Link>
                                <button onClick={logout} className="nav-logout">
                                    <span className="hidden sm:inline">Logout</span>
                                    <span className="sm:hidden">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

export default Navbar;