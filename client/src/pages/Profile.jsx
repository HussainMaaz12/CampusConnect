import Navbar from "../components/Navbar";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const profileCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  .profile-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    position: relative;
  }
  .profile-root h1, .profile-root h2, .profile-root h3, .profile-root .heading {
    font-family: 'Syne', sans-serif;
  }

  /* Rich background */
  .profile-canvas {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: #060608;
  }
  .profile-canvas::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 50% 40% at 20% 15%, rgba(168,85,247,0.08) 0%, transparent 55%),
      radial-gradient(ellipse 55% 45% at 80% 85%, rgba(249,115,22,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 40% 30% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 55%);
    animation: _bgFloat 22s ease-in-out infinite alternate;
  }
  @keyframes _bgFloat {
    0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.85; }
  }
  .profile-canvas::after {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .p-blob {
    position: fixed; border-radius: 50%; pointer-events: none; filter: blur(80px); z-index: 0;
  }
  .p-blob-1 { width: 350px; height: 350px; background: rgba(168,85,247,0.06); top: -80px; right: -50px; animation: _bDrift 25s ease-in-out infinite; }
  .p-blob-2 { width: 300px; height: 300px; background: rgba(249,115,22,0.05); bottom: -60px; left: -60px; animation: _bDrift 28s ease-in-out infinite reverse; }
  @keyframes _bDrift {
    0%,100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(20px,-15px) scale(1.04); }
    66% { transform: translate(-15px,20px) scale(0.96); }
  }

  .p-noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.35;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .p-content { position: relative; z-index: 1; }

  /* Glass cards */
  .p-glass {
    background: linear-gradient(145deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.015) 100%);
    border: 1px solid rgba(255,255,255,0.055);
    border-radius: 22px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0,0,0,0.15);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .p-glass:hover { border-color: rgba(255,255,255,0.08); box-shadow: 0 6px 35px rgba(0,0,0,0.2); }

  /* Inputs */
  .p-input {
    width: 100%;
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 12px 16px;
    color: white;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    resize: none;
    transition: all 0.2s;
  }
  .p-input::placeholder { color: rgba(255,255,255,0.18); }
  .p-input:focus {
    border-color: rgba(249,115,22,0.35);
    background: rgba(249,115,22,0.025);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.06);
  }

  /* CTA */
  .p-cta {
    background: linear-gradient(115deg, #f97316, #ea580c);
    border: none; border-radius: 14px;
    padding: 11px 24px;
    color: #000; font-weight: 700; font-size: 13px;
    font-family: 'Syne', sans-serif;
    cursor: pointer; transition: all 0.15s;
    box-shadow: 0 4px 16px rgba(249,115,22,0.2);
  }
  .p-cta:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(249,115,22,0.35); }
  .p-cta:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Gradient text */
  .p-grad { background: linear-gradient(110deg, #a855f7 10%, #fb923c 50%, #f97316 90%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  /* Avatar upload */
  .avatar-container {
    position: relative; cursor: pointer;
    transition: transform 0.2s;
  }
  .avatar-container:hover { transform: scale(1.03); }
  .avatar-overlay {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.25s;
  }
  .avatar-container:hover .avatar-overlay { opacity: 1; }
  .avatar-ring {
    width: 110px; height: 110px;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, #f97316, #a855f7, #3b82f6);
    box-shadow: 0 0 30px rgba(249,115,22,0.15), 0 0 60px rgba(168,85,247,0.08);
  }
  .avatar-inner {
    width: 100%; height: 100%;
    border-radius: 50%;
    background: #111;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    font-size: 38px; font-weight: 800; color: white;
    font-family: 'Syne', sans-serif;
  }
  .avatar-inner img { width: 100%; height: 100%; object-fit: cover; }

  /* Stat card */
  .stat-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 18px;
    padding: 20px;
    backdrop-filter: blur(8px);
    transition: all 0.3s;
  }
  .stat-card:hover { border-color: rgba(255,255,255,0.08); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }

  /* Anim */
  .p-fade { animation: _pFade 0.45s ease forwards; opacity: 0; transform: translateY(10px); }
  @keyframes _pFade { to { opacity: 1; transform: translateY(0); } }

  /* Post card in profile */
  .my-post-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 18px;
    padding: 20px 22px;
    transition: all 0.25s;
  }
  .my-post-card:hover { border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }

  .p-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(0,0,0,0.25); border-top-color: #000;
    border-radius: 50%; animation: _pspin 0.5s linear infinite;
    display: inline-block; vertical-align: middle; margin-right: 6px;
  }
  @keyframes _pspin { to { transform: rotate(360deg); } }

  /* Banner gradient */
  .profile-banner {
    height: 160px;
    background: linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(168,85,247,0.12) 40%, rgba(59,130,246,0.08) 100%);
    border-radius: 22px 22px 0 0;
    position: relative;
    overflow: hidden;
  }
  .profile-banner::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(6,6,8,0.8) 100%);
  }
  .profile-banner-pattern {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(249,115,22,0.12) 0%, transparent 50%),
      radial-gradient(circle at 80% 30%, rgba(168,85,247,0.10) 0%, transparent 50%);
    animation: _bannerShift 15s ease-in-out infinite alternate;
  }
  @keyframes _bannerShift { 0% { opacity: 0.7; } 100% { opacity: 1; } }
`;

const catCfg = {
    General:       { emoji: "💬", c: "#a1a1aa" },
    Academic:      { emoji: "📚", c: "#60a5fa" },
    Events:        { emoji: "🎉", c: "#c084fc" },
    Clubs:         { emoji: "🏛️", c: "#4ade80" },
    "Lost & Found":{ emoji: "🔍", c: "#facc15" },
    Hostel:        { emoji: "🏠", c: "#22d3ee" },
    Confession:    { emoji: "🤫", c: "#f472b6" },
};

function timeAgo(d) {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const dy = Math.floor(h / 24);
    if (dy < 7) return `${dy}d ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Profile() {
    const { authUser, updateAuthUser } = useAuth();
    const fileInputRef = useRef(null);

    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [editForm, setEditForm] = useState({
        name: authUser?.name || "",
        bio: authUser?.bio || "",
    });

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/posts/my-posts");
            if (response.data.success) setMyPosts(response.data.posts);
        } catch (err) {
            setError("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError(""); setSuccessMessage("");
        if (!editForm.name.trim()) { setError("Name cannot be empty"); return; }

        try {
            setSavingProfile(true);
            const response = await api.put("/auth/update-profile", {
                name: editForm.name,
                bio: editForm.bio,
            });
            if (response.data.success) {
                updateAuthUser(response.data.user);
                setSuccessMessage("Profile updated successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file"); return;
        }
        if (file.size > 1.5 * 1024 * 1024) {
            setError("Image must be under 1.5MB"); return;
        }

        try {
            setUploadingAvatar(true);
            setError("");

            // Convert to base64
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const base64 = ev.target.result;
                    const response = await api.put("/auth/update-profile", { avatar: base64 });
                    if (response.data.success) {
                        updateAuthUser(response.data.user);
                        setSuccessMessage("Profile picture updated!");
                        setTimeout(() => setSuccessMessage(""), 3000);
                    }
                } catch (err) {
                    setError("Failed to upload picture");
                } finally {
                    setUploadingAvatar(false);
                }
            };
            reader.readAsDataURL(file);
        } catch {
            setError("Failed to process image");
            setUploadingAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setUploadingAvatar(true);
            const response = await api.put("/auth/update-profile", { avatar: "" });
            if (response.data.success) {
                updateAuthUser(response.data.user);
                setSuccessMessage("Profile picture removed");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch {
            setError("Failed to remove picture");
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Stats
    const totalLikes = myPosts.reduce((s, p) => s + (p.likes?.length || 0), 0);
    const totalComments = myPosts.reduce((s, p) => s + (p.comments?.length || 0), 0);

    useEffect(() => { fetchMyPosts(); }, []);
    useEffect(() => {
        if (authUser) setEditForm({ name: authUser.name || "", bio: authUser.bio || "" });
    }, [authUser]);

    return (
        <div className="profile-root">
            <style dangerouslySetInnerHTML={{ __html: profileCSS }} />

            {/* Background */}
            <div className="profile-canvas" />
            <div className="p-blob p-blob-1" />
            <div className="p-blob p-blob-2" />
            <div className="p-noise" />

            <div className="p-content">
                <Navbar />

                <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 pb-20">

                    {/* ─── Hero Profile Card ─── */}
                    <div className="p-glass overflow-hidden mb-6 p-fade">
                        {/* Banner */}
                        <div className="profile-banner">
                            <div className="profile-banner-pattern" />
                        </div>

                        <div className="px-6 sm:px-8 pb-7 -mt-14 relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                                {/* Avatar */}
                                <div className="avatar-container" onClick={() => !uploadingAvatar && fileInputRef.current?.click()}>
                                    <div className="avatar-ring">
                                        <div className="avatar-inner">
                                            {uploadingAvatar ? (
                                                <div className="animate-pulse text-white/30 text-sm">...</div>
                                            ) : authUser?.avatar ? (
                                                <img src={authUser.avatar} alt={authUser.name} />
                                            ) : (
                                                authUser?.name?.charAt(0)?.toUpperCase() || "U"
                                            )}
                                        </div>
                                    </div>
                                    <div className="avatar-overlay">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0 pb-1">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white/90 leading-tight">
                                        {authUser?.name || "Unknown User"}
                                    </h1>
                                    <p className="text-orange-400/60 text-[14px] font-medium mt-0.5">@{authUser?.username || "unknown"}</p>
                                    <p className="text-white/25 text-[13px] mt-1.5 flex items-center gap-1.5">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                        {authUser?.email}
                                    </p>
                                </div>

                                {/* Avatar actions */}
                                <div className="flex gap-2 sm:pb-1">
                                    {authUser?.avatar && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                                            disabled={uploadingAvatar}
                                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-400/50 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 transition"
                                        >
                                            Remove Photo
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-white/35 text-[14px] leading-relaxed mt-4 max-w-lg">
                                {authUser?.bio || "Hey there! I am using CampusConnect."}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-5 rounded-2xl border border-red-500/15 bg-red-500/6 px-4 py-3 flex items-center gap-2.5 p-fade">
                            <span className="text-red-400 text-sm">⚠</span>
                            <p className="text-red-300/80 text-[13px] flex-1">{error}</p>
                            <button onClick={() => setError("")} className="text-red-400/30 hover:text-red-400/60 text-xs">✕</button>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/6 px-4 py-3 flex items-center gap-2.5 p-fade">
                            <span className="text-emerald-400 text-sm">✓</span>
                            <p className="text-emerald-300/80 text-[13px]">{successMessage}</p>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* ─── Left Column ─── */}
                        <div className="flex-1 space-y-6">

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 p-fade" style={{ animationDelay: '.06s' }}>
                                <div className="stat-card text-center">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 flex items-center justify-center mx-auto mb-3">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                    </div>
                                    <p className="text-white/85 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{myPosts.length}</p>
                                    <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Posts</p>
                                </div>
                                <div className="stat-card text-center">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-500/5 flex items-center justify-center mx-auto mb-3">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                                    </div>
                                    <p className="text-rose-400/90 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{totalLikes}</p>
                                    <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Likes</p>
                                </div>
                                <div className="stat-card text-center">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/5 flex items-center justify-center mx-auto mb-3">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                                    </div>
                                    <p className="text-blue-400/90 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{totalComments}</p>
                                    <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Comments</p>
                                </div>
                            </div>

                            {/* Edit Profile */}
                            <div className="p-glass p-6 sm:p-7 p-fade" style={{ animationDelay: '.1s' }}>
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </div>
                                    <h2 className="text-white/70 text-[16px] font-bold">Edit Profile</h2>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-white/30 text-[12px] font-semibold mb-2 uppercase tracking-wider">Display Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                                            className="p-input"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/30 text-[12px] font-semibold mb-2 uppercase tracking-wider">Bio</label>
                                        <textarea
                                            rows="3"
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                                            className="p-input"
                                            placeholder="Tell us about yourself..."
                                            maxLength={300}
                                        />
                                        <p className="text-right text-white/10 text-[10px] mt-1">{editForm.bio.length}/300</p>
                                    </div>
                                    <button type="submit" disabled={savingProfile} className="p-cta">
                                        {savingProfile ? <><span className="p-spinner" />Saving...</> : "Save Changes →"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* ─── Right: My Posts ─── */}
                        <div className="lg:w-[380px] flex-shrink-0">
                            <div className="p-glass p-6 sm:p-7 p-fade" style={{ animationDelay: '.14s' }}>
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                                    </div>
                                    <h2 className="text-white/70 text-[16px] font-bold">My Posts</h2>
                                    <span className="text-white/15 text-[11px] font-medium ml-auto">{myPosts.length} total</span>
                                </div>

                                {loading ? (
                                    <div className="space-y-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="my-post-card animate-pulse">
                                                <div className="h-3 bg-white/[0.03] rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-white/[0.03] rounded w-1/2" />
                                            </div>
                                        ))}
                                    </div>
                                ) : myPosts.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-3xl mb-2">📝</p>
                                        <p className="text-white/25 text-[13px] font-medium">No posts yet</p>
                                        <p className="text-white/12 text-[11px] mt-1">Go to the feed to share something!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent' }}>
                                        {myPosts.map((post) => {
                                            const cat = catCfg[post.category] || catCfg.General;
                                            return (
                                                <div key={post._id} className="my-post-card">
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${cat.c}12`, color: cat.c }}>
                                                            {cat.emoji} {post.category}
                                                        </span>
                                                        <span className="text-white/15 text-[10px]">{timeAgo(post.createdAt)}</span>
                                                    </div>
                                                    <p className="text-white/50 text-[13px] leading-relaxed line-clamp-3">{post.content}</p>
                                                    <div className="flex gap-4 mt-3 text-[11px] text-white/20">
                                                        <span className="flex items-center gap-1">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                                                            {post.likes?.length || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                                                            {post.comments?.length || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;