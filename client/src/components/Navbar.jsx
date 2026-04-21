import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import api from "../api/axios";

function Navbar() {
    const { authUser, isAuthenticated, logout } = useAuth();
    const { socket, isOnline } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;
    const getInitial = (name) => (name || "U").charAt(0).toUpperCase();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsRef = useRef();
    
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef();

    // Fetch initial notifications
    useEffect(() => {
        if (isAuthenticated) {
            api.get("/notifications").then(res => {
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                    setUnreadCount(res.data.count);
                }
            }).catch(() => {});
        }
    }, [isAuthenticated]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;
        const handleNotif = (data) => {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
        };
        socket.on("notification:new", handleNotif);
        return () => socket.off("notification:new", handleNotif);
    }, [socket]);

    const handleNotifClick = () => {
        const toggle = !notifOpen;
        setNotifOpen(toggle);
        if (toggle && unreadCount > 0) {
            api.put("/notifications/read").catch(()=>{});
            setUnreadCount(0);
        }
    };

    // Close dropdowns if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setSettingsOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                @media (min-width: 640px) {
                    .nav-glass {
                        border-top: none;
                        border-bottom: 1px solid rgba(255,255,255,0.04);
                    }
                    .nav-glow {
                        top: auto;
                        bottom: -1px;
                    }
                    .nav-link.active::after {
                        top: auto;
                        bottom: -13px;
                    }
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
            <header className="navbar-root fixed bottom-0 sm:sticky sm:bottom-auto sm:top-0 w-full z-50 nav-glass">
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
                                
                                    {/* Chat Notification Shortcut */}
                                    <Link to="/chat" className="relative nav-logout text-white/50 hover:text-white flex items-center justify-center !p-2" title="Messages">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                        </svg>
                                    </Link>

                                    {/* Notification Bell */}
                                    <div className="relative" ref={notifRef}>
                                        <button onClick={handleNotifClick} className="relative nav-logout text-white/50 hover:text-white flex items-center justify-center !p-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border border-[#0A0A0F] rounded-full animate-pulse"></span>
                                            )}
                                        </button>
                                        
                                        {notifOpen && (
                                            <div className="absolute right-0 top-[calc(100%+8px)] w-72 md:w-80 rounded-2xl border border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-2xl z-50 animate-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[70vh]">
                                                <div className="p-3 border-b border-white/5 font-semibold text-white text-[13px]">Notifications</div>
                                                <div className="overflow-y-auto no-scrollbar flex-1 p-2">
                                                    {notifications.length === 0 ? (
                                                        <p className="text-white/30 text-center py-4 text-xs">No notifications yet.</p>
                                                    ) : (
                                                        notifications.map((n, i) => (
                                                            <div 
                                                                key={i} 
                                                                onClick={() => {
                                                                    setNotifOpen(false);
                                                                    if (n.sender) {
                                                                        navigate("/chat", { state: { user: n.sender } });
                                                                    }
                                                                }}
                                                                className="flex gap-3 text-xs p-2 rounded-xl hover:bg-white/5 transition mb-1 text-white/70 items-center cursor-pointer"
                                                            >
                                                                {n.sender?.avatar ? (
                                                                    <img src={n.sender.avatar} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center font-bold text-white text-[10px]">{n.sender?.name?.charAt(0) || "U"}</div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <span className="font-semibold text-white">{n.sender?.name}</span> {n.content || n.message}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
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

                                    {/* Settings Dropdown */}
                                    <div className="relative" ref={settingsRef}>
                                        <button onClick={() => setSettingsOpen(!settingsOpen)} className="nav-logout text-white/50 hover:text-white flex items-center justify-center !p-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                            </svg>
                                        </button>

                                        {settingsOpen && (
                                            <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between p-3 border-b border-white/5 mb-2">
                                                    <span className="text-white/80 text-[13px] font-semibold">Appearance</span>
                                                    <ThemeToggle size="sm" showLabel={false} />
                                                </div>
                                                <button className="w-full text-left p-3 rounded-xl text-[13px] text-white/50 hover:bg-white/5 hover:text-white transition">Account Settings</button>
                                                <button className="w-full text-left p-3 rounded-xl text-[13px] text-white/50 hover:bg-white/5 hover:text-white transition">Privacy & Safety</button>
                                                <button className="w-full text-left p-3 rounded-xl text-[13px] text-white/50 hover:bg-white/5 hover:text-white transition">Notifications</button>
                                            </div>
                                        )}
                                    </div>
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