import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useState } from "react";

function Navbar() {
    const { authUser, isAuthenticated, logout } = useAuth();
    const { isOnline } = useSocket();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const getInitial = (name) => (name || "U").charAt(0).toUpperCase();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
                .navbar-root { font-family: 'DM Sans', sans-serif; }
                .nav-glass {
                    background: rgba(10,10,15,0.88);
                    backdrop-filter: blur(24px) saturate(1.6);
                    -webkit-backdrop-filter: blur(24px) saturate(1.6);
                    border-top: 1px solid rgba(255,255,255,0.04);
                    transition: background 0.3s;
                }
                .nav-glow {
                    position: absolute;
                    top: -1px; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent 5%, rgba(108,99,255,0.5) 30%, rgba(0,212,170,0.4) 50%, rgba(255,107,107,0.3) 70%, transparent 95%);
                    opacity: 0.6;
                }
                .nav-link {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 18px; border-radius: 14px;
                    font-size: 14px; font-weight: 500;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1); position: relative;
                    color: rgba(255,255,255,0.35); text-decoration: none;
                    white-space: nowrap;
                }
                .nav-link:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
                .nav-link.active { color: #6C63FF; background: rgba(108,99,255,0.08); }
                .nav-link.active::after {
                    content: ''; position: absolute;
                    top: -13px; left: 50%; transform: translateX(-50%);
                    width: 24px; height: 3px;
                    background: linear-gradient(90deg, #6C63FF, #00D4AA);
                    border-radius: 2px;
                }
                .nav-avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; font-weight: 700;
                    background: linear-gradient(135deg, #6C63FF, #00D4AA);
                    color: #fff;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
                    overflow: hidden;
                    box-shadow: 0 0 0 2px rgba(108,99,255,0.2);
                }
                .nav-avatar:hover { box-shadow: 0 0 0 3px rgba(108,99,255,0.4); transform: scale(1.08); }
                .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .nav-online-dot {
                    position: absolute; bottom: 0; right: 0;
                    width: 10px; height: 10px; border-radius: 50%;
                    background: #00D4AA;
                    border: 2px solid #0A0A0F;
                    animation: onlinePulse 2s ease-in-out infinite;
                }
                @keyframes onlinePulse {
                    0%,100% { box-shadow: 0 0 0 0 rgba(0,212,170,0.5); }
                    50% { box-shadow: 0 0 0 4px rgba(0,212,170,0); }
                }
                .nav-logout {
                    padding: 8px 16px; border-radius: 12px;
                    font-size: 13px; font-weight: 600;
                    background: rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.35);
                    border: 1px solid rgba(255,255,255,0.06);
                    cursor: pointer; transition: all 0.25s;
                    white-space: nowrap;
                }
                .nav-logout:hover { background: rgba(255,107,107,0.08); border-color: rgba(255,107,107,0.15); color: #FF6B6B; }
                .nav-brand { font-family: 'Syne', sans-serif; }
                .nav-mobile-btn {
                    display: none; background: none; border: none; cursor: pointer;
                    color: rgba(255,255,255,0.5); padding: 8px; border-radius: 10px;
                    transition: all 0.2s;
                }
                .nav-mobile-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
                @media (max-width: 640px) {
                    .nav-mobile-btn { display: flex; }
                    .nav-desktop-links { display: none !important; }
                    .nav-mobile-menu {
                        position: fixed; bottom: 60px; left: 0; right: 0; top: 0;
                        background: rgba(10,10,15,0.96);
                        backdrop-filter: blur(20px);
                        z-index: 100; padding: 20px 24px;
                        display: flex; flex-direction: column; gap: 8px;
                        animation: slideUp 0.25s ease;
                    }
                    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                }
            `}} />
            <header className="navbar-root fixed bottom-0 w-full z-50 nav-glass">
                <div className="relative">
                    <div className="nav-glow" />
                    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
                        {/* Brand */}
                        <Link to={isAuthenticated ? "/feed" : "/"} className="flex items-center gap-2.5 group flex-shrink-0">
                            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center text-[11px] font-extrabold shadow-lg transition-all duration-300 group-hover:scale-105" style={{
                                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                                color: "#fff",
                                boxShadow: "0 4px 16px rgba(108,99,255,0.25)",
                            }}>
                                CC
                            </div>
                            <span className="nav-brand text-white/90 font-bold text-[16px] tracking-tight hidden sm:inline">
                                Campus<span style={{ color: "#6C63FF" }}>Connect</span>
                            </span>
                        </Link>

                        {/* Center Nav — Desktop */}
                        <nav className="nav-desktop-links flex items-center gap-1">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/feed" className={`nav-link ${isActive("/feed") ? "active" : ""}`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive("/feed") ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                        <span>Feed</span>
                                    </Link>
                                    <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive("/profile") ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span>Profile</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={`nav-link ${isActive("/login") ? "active" : ""}`}>Login</Link>
                                    <Link to="/register" className="px-5 py-2 rounded-xl text-[13px] font-semibold transition-all hover:scale-[1.02]" style={{
                                        background: "linear-gradient(115deg, #6C63FF, #00D4AA)",
                                        color: "#fff",
                                        boxShadow: "0 4px 16px rgba(108,99,255,0.25)",
                                    }}>
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Right - User & Logout */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                            {isAuthenticated && (
                                <>
                                    <Link to="/profile" className="flex items-center gap-2 group">
                                        <div className="nav-avatar">
                                            {authUser?.avatar ? (
                                                <img src={authUser.avatar} alt={authUser.name} />
                                            ) : (
                                                getInitial(authUser?.name)
                                            )}
                                            {isOnline(authUser?._id) && <span className="nav-online-dot" />}
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
                                </>
                            )}

                            {/* Mobile hamburger */}
                            <button className="nav-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                                {mobileOpen ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="nav-mobile-menu" onClick={() => setMobileOpen(false)}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/feed" className={`nav-link ${isActive("/feed") ? "active" : ""}`} style={{ fontSize: 16, padding: "14px 20px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive("/feed") ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                Feed
                            </Link>
                            <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`} style={{ fontSize: 16, padding: "14px 20px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive("/profile") ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                Profile
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" style={{ fontSize: 16, padding: "14px 20px" }}>Login</Link>
                            <Link to="/register" className="nav-link" style={{ fontSize: 16, padding: "14px 20px", color: "#6C63FF" }}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

export default Navbar;