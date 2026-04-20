import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Navbar from "../components/Navbar";

const feedCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  .feed-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    position: relative;
  }
  .feed-root h1, .feed-root h2, .feed-root .heading {
    font-family: 'Syne', sans-serif;
  }

  /* ─── Background ─── */
  .feed-canvas {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: #0A0A0F;
  }
  .feed-canvas::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 60% 45% at 10% 20%, rgba(108,99,255,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 90% 80%, rgba(0,212,170,0.05) 0%, transparent 55%),
      radial-gradient(ellipse 40% 35% at 50% 10%, rgba(167,139,250,0.04) 0%, transparent 55%);
    animation: bgFloat 20s ease-in-out infinite alternate;
  }
  @keyframes bgFloat {
    0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.85; }
  }
  .feed-canvas::after {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .feed-noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  .feed-content { position: relative; z-index: 1; }

  /* ─── Glass cards ─── */
  .glass-post {
    background: rgba(14,14,20,0.85);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 20px;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 2px 20px rgba(0,0,0,0.15);
  }
  .glass-post:hover {
    border-color: rgba(255,255,255,0.08);
    box-shadow: 0 8px 40px rgba(0,0,0,0.25);
    transform: translateY(-1px);
  }

  .glass-compose {
    background: rgba(14,14,20,0.88);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 22px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.2);
  }

  .glass-sidebar {
    background: rgba(14,14,20,0.85);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 20px;
  }

  /* ─── Inputs ─── */
  .f-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 12px 16px;
    color: white;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none; resize: none;
    transition: all 0.25s;
  }
  .f-input::placeholder { color: rgba(255,255,255,0.2); }
  .f-input:focus {
    border-color: rgba(108,99,255,0.35);
    background: rgba(108,99,255,0.02);
    box-shadow: 0 0 0 3px rgba(108,99,255,0.06);
  }

  /* ─── Category chips ─── */
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 5px 11px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
    cursor: pointer; transition: all 0.25s;
    border: 1px solid transparent;
    user-select: none; white-space: nowrap;
  }
  .chip:hover { transform: translateY(-1px); filter: brightness(1.15); }

  /* ─── Post actions ─── */
  .act-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 10px;
    font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    border: none; background: transparent;
    color: rgba(255,255,255,0.3);
    font-family: 'DM Sans', sans-serif;
  }
  .act-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
  .act-btn.liked { color: #FF6B6B; }
  .act-btn.liked:hover { background: rgba(255,107,107,0.08); }
  .act-btn.bookmarked { color: #FFD93D; }
  .act-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ─── CTA Button ─── */
  .cta-btn {
    background: linear-gradient(115deg, #6C63FF 0%, #00D4AA 100%);
    border: none; border-radius: 12px;
    padding: 9px 18px; color: #fff;
    font-weight: 700; font-size: 12px;
    font-family: 'Syne', sans-serif;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(108,99,255,0.2);
  }
  .cta-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(108,99,255,0.35); }
  .cta-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ─── Gradient text ─── */
  .grad-text {
    background: linear-gradient(110deg, #6C63FF 10%, #00D4AA 40%, #A78BFA 90%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* ─── Skeleton ─── */
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 75%);
    background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; border-radius: 8px;
  }

  /* ─── Animations ─── */
  .fade-in { animation: _fadeIn 0.45s ease forwards; opacity: 0; transform: translateY(10px); }
  @keyframes _fadeIn { to { opacity: 1; transform: translateY(0); } }

  @keyframes heartPop { 0%{transform:scale(1)} 35%{transform:scale(1.25)} 70%{transform:scale(0.95)} 100%{transform:scale(1)} }
  .heart-pop { animation: heartPop 0.3s ease; }

  .f-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: _spin 0.5s linear infinite; display: inline-block; vertical-align: middle; margin-right: 5px; }
  @keyframes _spin { to { transform: rotate(360deg); } }

  .err-shake { animation: _shake 0.35s ease; }
  @keyframes _shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

  /* ─── Comment ─── */
  .cmt-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 10px 14px; transition: border-color 0.2s; }
  .cmt-card:hover { border-color: rgba(255,255,255,0.07); }
  .cmts-wrap { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
  .cmts-wrap.open { max-height: 2000px; }

  /* ─── Select ─── */
  .f-select { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 9px 12px; color: rgba(255,255,255,0.5); font-size: 12px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; appearance: none; transition: border-color 0.2s; }
  .f-select:focus { border-color: rgba(108,99,255,0.35); }
  .f-select option { background: #151520; color: white; }

  /* ─── Search ─── */
  .search-wrap { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; transition: all 0.25s; }
  .search-wrap:focus-within { border-color: rgba(108,99,255,0.25); box-shadow: 0 0 0 3px rgba(108,99,255,0.05); background: rgba(255,255,255,0.03); }

  /* ─── Sidebar items ─── */
  .trend-item { padding: 10px 14px; border-radius: 12px; transition: background 0.2s; cursor: pointer; }
  .trend-item:hover { background: rgba(255,255,255,0.03); }

  /* ─── Story bar ─── */
  .story-ring { padding: 2px; border-radius: 50%; background: linear-gradient(135deg, #6C63FF, #00D4AA, #FFD93D); }
  .story-ring-seen { background: rgba(255,255,255,0.1); }
  .story-inner { width: 100%; height: 100%; border-radius: 50%; background: #0A0A0F; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .story-inner img { width: 100%; height: 100%; object-fit: cover; }

  /* ─── Media grid ─── */
  .media-grid { display: grid; gap: 4px; border-radius: 16px; overflow: hidden; }
  .media-grid.g1 { grid-template-columns: 1fr; }
  .media-grid.g2 { grid-template-columns: 1fr 1fr; }
  .media-grid.g3 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
  .media-grid.g3 > :first-child { grid-row: 1/3; }
  .media-grid.g4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
  .media-grid img, .media-grid video { width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.2s; }
  .media-grid img:hover, .media-grid video:hover { transform: scale(1.02); }

  /* ─── Media preview in compose ─── */
  .media-preview { display: flex; gap: 8px; flex-wrap: wrap; padding: 8px 0; }
  .media-thumb { position: relative; width: 72px; height: 72px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
  .media-thumb img, .media-thumb video { width: 100%; height: 100%; object-fit: cover; }
  .media-thumb-remove { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; border: none; transition: background 0.2s; }
  .media-thumb-remove:hover { background: #FF6B6B; }

  /* ─── Online dot ─── */
  .online-dot { width: 8px; height: 8px; border-radius: 50%; background: #00D4AA; box-shadow: 0 0 6px rgba(0,212,170,0.5); }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* ─── Story modal / lightbox ─── */
  .lightbox-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
  .lightbox-overlay img, .lightbox-overlay video { max-width: 90vw; max-height: 90vh; border-radius: 12px; }
`;

function timeAgo(d) {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return "now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const dy = Math.floor(h / 24);
    if (dy < 7) return `${dy}d`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Avatar({ name, avatar, size = 36, className = "", online = false }) {
    const grads = [
        ["#6C63FF", "#00D4AA"], ["#A78BFA", "#FF6B6B"], ["#00D4AA", "#FFD93D"],
        ["#FF6B6B", "#6C63FF"], ["#FFD93D", "#A78BFA"], ["#6C63FF", "#A78BFA"],
    ];
    const i = ((name || "U").charCodeAt(0) + (name || "U").length) % grads.length;
    return (
        <div className={`flex-shrink-0 relative ${className}`}>
            <div
                className="flex items-center justify-center font-bold text-white"
                style={{
                    width: size, height: size, borderRadius: "50%",
                    background: avatar ? "none" : `linear-gradient(135deg, ${grads[i][0]}, ${grads[i][1]})`,
                    fontSize: size * 0.38, overflow: "hidden",
                }}
            >
                {avatar ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name || "U").charAt(0).toUpperCase()}
            </div>
            {online && <span className="online-dot absolute -bottom-0.5 -right-0.5" style={{ border: "2px solid #0A0A0F" }} />}
        </div>
    );
}

const catCfg = {
    General:       { emoji: "💬", c: "#a1a1aa", bg: "rgba(161,161,170,0.08)", b: "rgba(161,161,170,0.12)" },
    Academic:      { emoji: "📚", c: "#60a5fa", bg: "rgba(96,165,250,0.08)",  b: "rgba(96,165,250,0.12)" },
    Events:        { emoji: "🎉", c: "#c084fc", bg: "rgba(192,132,252,0.08)", b: "rgba(192,132,252,0.12)" },
    Clubs:         { emoji: "🏛️", c: "#4ade80", bg: "rgba(74,222,128,0.08)",  b: "rgba(74,222,128,0.12)" },
    "Lost & Found":{ emoji: "🔍", c: "#facc15", bg: "rgba(250,204,21,0.08)",  b: "rgba(250,204,21,0.12)" },
    Hostel:        { emoji: "🏠", c: "#22d3ee", bg: "rgba(34,211,238,0.08)",  b: "rgba(34,211,238,0.12)" },
    Confession:    { emoji: "🤫", c: "#f472b6", bg: "rgba(244,114,182,0.08)", b: "rgba(244,114,182,0.12)" },
};

function CatBadge({ cat, small }) {
    const cf = catCfg[cat] || catCfg.General;
    return (
        <span className={small ? "chip !py-0.5 !px-2 !text-[9px] !gap-1" : "chip"} style={{ background: cf.bg, color: cf.c, borderColor: cf.b }}>
            {cf.emoji} {cat}
        </span>
    );
}

function PostSkeleton() {
    return (
        <div className="glass-post p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="skel w-9 h-9 rounded-full" />
                <div className="flex-1"><div className="skel h-3 w-24 mb-2" /><div className="skel h-2.5 w-16" /></div>
            </div>
            <div className="skel h-3 w-full mb-2" /><div className="skel h-3 w-4/5 mb-2" /><div className="skel h-3 w-3/5 mb-4" />
            <div className="flex gap-3"><div className="skel h-7 w-16 rounded-lg" /><div className="skel h-7 w-16 rounded-lg" /></div>
        </div>
    );
}

function MediaGrid({ media }) {
    const [lightbox, setLightbox] = useState(null);
    if (!media || media.length === 0) return null;
    const count = Math.min(media.length, 4);
    return (
        <>
            <div className={`media-grid g${count} mb-3`} style={{ maxHeight: 400 }}>
                {media.slice(0, 4).map((m, i) => (
                    m.type === "video" ? (
                        <video key={i} src={m.url} controls style={{ maxHeight: count === 1 ? 400 : 200 }} />
                    ) : (
                        <img key={i} src={m.url} alt="" style={{ maxHeight: count === 1 ? 400 : 200 }} onClick={() => setLightbox(m)} />
                    )
                ))}
            </div>
            {lightbox && (
                <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
                    <img src={lightbox.url} alt="" />
                </div>
            )}
        </>
    );
}

function Feed() {
    const { authUser } = useAuth();
    const { socket, onlineUsers, isOnline } = useSocket();
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [postContent, setPostContent] = useState("");
    const [postCategory, setPostCategory] = useState("General");
    const [postType, setPostType] = useState("post");
    const [mediaFiles, setMediaFiles] = useState([]);
    const [commentInputs, setCommentInputs] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [creatingPost, setCreatingPost] = useState(false);
    const [likingPostId, setLikingPostId] = useState(null);
    const [commentingPostId, setCommentingPostId] = useState(null);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [error, setError] = useState("");
    const [expandedComments, setExpandedComments] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("General");
    const [savingEdit, setSavingEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [suggestions, setSuggestions] = useState([]);
    const [storyModal, setStoryModal] = useState(null);
    const mediaInputRef = useRef(null);

    const categories = ["General", "Academic", "Events", "Clubs", "Lost & Found", "Hostel", "Confession"];

    const filteredPosts = useMemo(() => {
        return posts.filter((p) => {
            if (filterCategory !== "All" && p.category !== filterCategory) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return p.content?.toLowerCase().includes(q) || p.author?.name?.toLowerCase().includes(q) || p.author?.username?.toLowerCase().includes(q);
            }
            return true;
        });
    }, [posts, searchQuery, filterCategory]);

    const catStats = useMemo(() => {
        const counts = {};
        posts.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
        return counts;
    }, [posts]);

    const totalLikes = useMemo(() => posts.reduce((s, p) => s + (p.likes?.length || 0), 0), [posts]);
    const totalComments = useMemo(() => posts.reduce((s, p) => s + (p.comments?.length || 0), 0), [posts]);

    const fetchPosts = async () => { try { setLoadingPosts(true); const r = await api.get("/posts"); if (r.data.success) setPosts(r.data.posts); } catch(e) { setError("Failed to load posts"); } finally { setLoadingPosts(false); } };
    const fetchStories = async () => { try { const r = await api.get("/posts/stories"); if (r.data.success) setStories(r.data.storyGroups || []); } catch(e) { /* silent */ } };
    const fetchSuggestions = async () => { try { const r = await api.get("/auth/suggestions"); if (r.data.success) setSuggestions(r.data.users || []); } catch(e) { /* silent */ } };

    const handleMediaSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (mediaFiles.length + files.length > 4) { setError("Max 4 files per post"); return; }
        files.forEach(file => {
            if (file.size > 50 * 1024 * 1024) { setError("File too large (max 50MB)"); return; }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setMediaFiles(prev => [...prev, {
                    data: ev.target.result,
                    type: file.type.startsWith("video/") ? "video" : "image",
                    name: file.name,
                    preview: ev.target.result,
                }]);
            };
            reader.readAsDataURL(file);
        });
        if (mediaInputRef.current) mediaInputRef.current.value = "";
    };

    const removeMedia = (idx) => setMediaFiles(prev => prev.filter((_, i) => i !== idx));

    const handleCreatePost = async (e) => {
        e.preventDefault(); setError("");
        if (!postContent.trim() && mediaFiles.length === 0) return;
        try {
            setCreatingPost(true);
            const payload = { content: postContent || "📸", category: postCategory, postType };
            if (mediaFiles.length > 0) { payload.mediaFiles = mediaFiles.map(f => ({ data: f.data, type: f.type })); }
            const r = await api.post("/posts", payload);
            if (r.data.success) { setPostContent(""); setPostCategory("General"); setMediaFiles([]); setPostType("post"); await fetchPosts(); if (postType === "story") await fetchStories(); }
        } catch(e) { setError(e.response?.data?.message || "Failed to create post"); }
        finally { setCreatingPost(false); }
    };

    const handleToggleLike = async (id) => { try { setLikingPostId(id); const r = await api.put(`/posts/${id}/like`); if (r.data.success) await fetchPosts(); } catch(e) { setError(e.response?.data?.message || "Failed"); } finally { setLikingPostId(null); } };
    const handleAddComment = async (id) => { const t = commentInputs[id]; if (!t?.trim()) return; try { setCommentingPostId(id); const r = await api.post(`/posts/${id}/comment`, { text: t }); if (r.data.success) { setCommentInputs(p => ({ ...p, [id]: "" })); await fetchPosts(); } } catch(e) { setError(e.response?.data?.message || "Failed"); } finally { setCommentingPostId(null); } };
    const handleDeletePost = async (id) => { if (!confirm("Delete this post?")) return; try { setDeletingPostId(id); const r = await api.delete(`/posts/${id}`); if (r.data.success) await fetchPosts(); } catch(e) { setError(e.response?.data?.message || "Failed"); } finally { setDeletingPostId(null); } };
    const handleToggleBookmark = async (id) => { try { await api.put(`/posts/${id}/bookmark`); await fetchPosts(); } catch(e) { /* silent */ } };
    const handleShare = async (id) => { try { await navigator.clipboard.writeText(`${window.location.origin}/feed#${id}`); await api.put(`/posts/${id}/share`); await fetchPosts(); } catch(e) { /* silent */ } };
    const startEditing = (p) => { setEditingPostId(p._id); setEditContent(p.content); setEditCategory(p.category || "General"); };
    const cancelEditing = () => { setEditingPostId(null); setEditContent(""); };
    const handleSaveEdit = async (id) => { if (!editContent.trim()) return; try { setSavingEdit(true); const r = await api.put(`/posts/${id}`, { content: editContent, category: editCategory }); if (r.data.success) { cancelEditing(); await fetchPosts(); } } catch(e) { setError(e.response?.data?.message || "Failed"); } finally { setSavingEdit(false); } };
    const isLiked = (p) => p.likes?.some(l => l === authUser?._id);
    const isBookmarked = (p) => p.bookmarks?.some(b => b === authUser?._id);
    const toggleComments = (id) => setExpandedComments(p => ({ ...p, [id]: !p[id] }));

    // Real-time listeners
    useEffect(() => {
        if (!socket) return;
        const handleNewPost = () => { fetchPosts(); fetchStories(); };
        const handleLike = (data) => { setPosts(prev => prev.map(p => p._id === data.postId ? { ...p, likes: data.likes } : p)); };
        const handleComment = (data) => { setPosts(prev => prev.map(p => p._id === data.postId ? { ...p, comments: data.comments } : p)); };
        socket.on("post:new", handleNewPost);
        socket.on("post:like", handleLike);
        socket.on("post:comment", handleComment);
        return () => { socket.off("post:new", handleNewPost); socket.off("post:like", handleLike); socket.off("post:comment", handleComment); };
    }, [socket]);

    useEffect(() => { fetchPosts(); fetchStories(); fetchSuggestions(); }, []);

    return (
        <div className="feed-root">
            <style dangerouslySetInnerHTML={{ __html: feedCSS }} />

            <div className="feed-canvas" />
            <div className="feed-noise" />

            <div className="feed-content">
                <Navbar />

                <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex gap-7">

                        {/* ════════════ MAIN FEED COLUMN ════════════ */}
                        <div className="flex-1 min-w-0">

                            {/* Header */}
                            <div className="mb-6 fade-in">
                                <h1 className="text-[1.7rem] sm:text-[2rem] font-extrabold leading-tight mb-1">
                                    <span className="grad-text">Campus Feed</span> ✨
                                </h1>
                                <p className="text-white/30 text-[13px]">
                                    Hey {authUser?.name?.split(" ")[0] || "there"} — see what's happening.
                                </p>
                            </div>

                            {/* ── Story Bar ── */}
                            {stories.length > 0 && (
                                <div className="mb-5 fade-in" style={{ animationDelay: '.02s' }}>
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                        {stories.map((group) => (
                                            <button key={group.author._id} className="flex flex-col items-center gap-1.5 flex-shrink-0" onClick={() => setStoryModal(group)}>
                                                <div className="story-ring" style={{ width: 62, height: 62 }}>
                                                    <div className="story-inner">
                                                        <Avatar name={group.author.name} avatar={group.author.avatar} size={56} />
                                                    </div>
                                                </div>
                                                <span className="text-white/40 text-[10px] font-medium truncate" style={{ maxWidth: 64 }}>{group.author.name?.split(" ")[0]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="err-shake mb-4 rounded-2xl border border-red-500/15 bg-red-500/6 px-4 py-3 flex items-center gap-2.5">
                                    <span className="text-red-400 text-sm">⚠</span>
                                    <p className="text-red-300/80 text-[13px] flex-1">{error}</p>
                                    <button onClick={() => setError("")} className="text-red-400/30 hover:text-red-400/60 text-xs">✕</button>
                                </div>
                            )}

                            {/* ── Compose ── */}
                            <div className="glass-compose p-5 mb-5 fade-in" style={{ animationDelay: '.04s' }}>
                                <div className="flex gap-3">
                                    <Avatar name={authUser?.name} avatar={authUser?.avatar} size={38} online={isOnline(authUser?._id)} />
                                    <div className="flex-1">
                                        <form onSubmit={handleCreatePost}>
                                            <textarea
                                                value={postContent}
                                                onChange={e => setPostContent(e.target.value)}
                                                placeholder={postType === "story" ? "Share a story… 📸" : "What's happening on campus? 💭"}
                                                rows="2"
                                                className="f-input !border-0 !bg-transparent !p-0 !text-[15px] !rounded-none mb-3"
                                                style={{ boxShadow: 'none' }}
                                                maxLength={2000}
                                            />

                                            {/* Media previews */}
                                            {mediaFiles.length > 0 && (
                                                <div className="media-preview">
                                                    {mediaFiles.map((f, i) => (
                                                        <div key={i} className="media-thumb">
                                                            {f.type === "video" ? (
                                                                <video src={f.preview} />
                                                            ) : (
                                                                <img src={f.preview} alt="" />
                                                            )}
                                                            <button className="media-thumb-remove" onClick={() => removeMedia(i)}>✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                                                <div className="flex items-center gap-2">
                                                    {/* Media upload */}
                                                    <button type="button" onClick={() => mediaInputRef.current?.click()} className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition" title="Add photo/video">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                                    </button>
                                                    <input ref={mediaInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaSelect} />

                                                    {/* Post type toggle */}
                                                    <button type="button" onClick={() => setPostType(postType === "post" ? "story" : "post")}
                                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition"
                                                        style={{
                                                            background: postType === "story" ? "rgba(255,217,61,0.10)" : "rgba(255,255,255,0.03)",
                                                            color: postType === "story" ? "#FFD93D" : "rgba(255,255,255,0.25)",
                                                            border: `1px solid ${postType === "story" ? "rgba(255,217,61,0.20)" : "rgba(255,255,255,0.04)"}`,
                                                        }}
                                                    >
                                                        {postType === "story" ? "📸 Story" : "📝 Post"}
                                                    </button>

                                                    <select value={postCategory} onChange={e => setPostCategory(e.target.value)} className="f-select !py-1.5 !px-2.5 !text-[11px]">
                                                        {categories.map(c => <option key={c} value={c}>{catCfg[c]?.emoji} {c}</option>)}
                                                    </select>
                                                    {postContent.length > 0 && (
                                                        <span className="text-[10px] text-white/15 tabular-nums">{postContent.length}/2000</span>
                                                    )}
                                                </div>
                                                <button type="submit" className="cta-btn" disabled={creatingPost || (!postContent.trim() && mediaFiles.length === 0)}>
                                                    {creatingPost ? <><span className="f-spinner"/>Posting…</> : postType === "story" ? "Share Story →" : "Post →"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* ── Search + Category chips ── */}
                            <div className="mb-5 fade-in" style={{ animationDelay: '.08s' }}>
                                <div className="search-wrap flex items-center px-3.5 gap-2 mb-3">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                    <input type="text" placeholder="Search posts, people…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-none outline-none flex-1 py-2.5 text-[12px] text-white/70 placeholder:text-white/18" style={{ fontFamily: "'DM Sans'" }} />
                                    {searchQuery && <button onClick={() => setSearchQuery("")} className="text-white/15 hover:text-white/40 text-[10px]">✕</button>}
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 flex-wrap">
                                    <button onClick={() => setFilterCategory("All")} className="chip" style={{ background: filterCategory === "All" ? "rgba(108,99,255,0.1)" : "rgba(255,255,255,0.03)", color: filterCategory === "All" ? "#A78BFA" : "rgba(255,255,255,0.25)", borderColor: filterCategory === "All" ? "rgba(108,99,255,0.18)" : "rgba(255,255,255,0.04)" }}>✦ All</button>
                                    {categories.map(c => { const cf = catCfg[c], a = filterCategory === c; return <button key={c} onClick={() => setFilterCategory(c)} className="chip" style={{ background: a ? cf.bg : "rgba(255,255,255,0.03)", color: a ? cf.c : "rgba(255,255,255,0.25)", borderColor: a ? cf.b : "rgba(255,255,255,0.04)" }}>{cf.emoji} {c}</button>; })}
                                </div>
                                {(searchQuery || filterCategory !== "All") && (
                                    <div className="flex items-center mt-2 text-[11px] text-white/20">
                                        <span>{filteredPosts.length} of {posts.length}</span>
                                        <button onClick={() => { setSearchQuery(""); setFilterCategory("All"); }} className="text-[#6C63FF]/50 hover:text-[#6C63FF] ml-auto">Clear</button>
                                    </div>
                                )}
                            </div>

                            {/* ── Posts ── */}
                            <div className="space-y-4">
                                {loadingPosts ? <><PostSkeleton/><PostSkeleton/><PostSkeleton/></> :
                                 filteredPosts.length === 0 ? (
                                    <div className="glass-post p-10 text-center fade-in">
                                        <p className="text-2xl mb-2">{posts.length === 0 ? "📝" : "🔍"}</p>
                                        <p className="text-white/30 text-[13px] font-medium">{posts.length === 0 ? "No posts yet — be the first!" : "No matches found."}</p>
                                    </div>
                                 ) : filteredPosts.map((post, idx) => {
                                    const liked = isLiked(post), bookmarked = isBookmarked(post), editing = editingPostId === post._id, owner = authUser?._id === post.author?._id;
                                    const cmtOpen = expandedComments[post._id], cmtCount = post.comments?.length || 0, likeCount = post.likes?.length || 0;

                                    return (
                                        <div key={post._id} className={`glass-post p-5 fade-in ${editing ? "!border-[#6C63FF]/20" : ""}`} style={{ animationDelay: `${Math.min(idx * 0.03, 0.25)}s` }}>
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <Link to={`/user/${post.author?.username}`}>
                                                        <Avatar name={post.author?.name} avatar={post.author?.avatar} size={36} online={isOnline(post.author?._id)} />
                                                    </Link>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Link to={`/user/${post.author?.username}`} className="text-white/80 text-[13px] font-semibold hover:text-white transition">{post.author?.name || "Unknown"}</Link>
                                                            {!editing && post.category && <CatBadge cat={post.category} small />}
                                                        </div>
                                                        <p className="text-white/25 text-[11px]">@{post.author?.username || "unknown"} · {timeAgo(post.createdAt)}</p>
                                                    </div>
                                                </div>
                                                {owner && !editing && (
                                                    <div className="flex gap-0.5">
                                                        <button onClick={() => startEditing(post)} className="p-1.5 rounded-lg text-white/15 hover:text-[#6C63FF] hover:bg-[#6C63FF]/6 transition" title="Edit">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                        </button>
                                                        <button onClick={() => handleDeletePost(post._id)} disabled={deletingPostId === post._id} className="p-1.5 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/6 disabled:opacity-30 transition" title="Delete">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            {editing ? (
                                                <div className="mb-3 space-y-2.5">
                                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows="3" className="f-input" />
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="f-select !py-1.5">{categories.map(c => <option key={c} value={c}>{catCfg[c]?.emoji} {c}</option>)}</select>
                                                        <div className="flex gap-1.5 ml-auto">
                                                            <button onClick={() => handleSaveEdit(post._id)} disabled={savingEdit} className="cta-btn !py-1.5 !px-3.5 !text-[11px]">{savingEdit ? "Saving…" : "Save"}</button>
                                                            <button onClick={cancelEditing} className="px-3.5 py-1.5 rounded-xl text-[11px] font-medium text-white/30 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition">Cancel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-white/65 text-[14px] leading-[1.65] mb-3 whitespace-pre-wrap">{post.content}</p>
                                            )}

                                            {/* Media */}
                                            {!editing && <MediaGrid media={post.media} />}

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 pt-2.5 border-t border-white/[0.03]">
                                                <button onClick={() => handleToggleLike(post._id)} disabled={likingPostId === post._id} className={`act-btn ${liked ? "liked" : ""}`}>
                                                    <span className={liked && likingPostId !== post._id ? "heart-pop" : ""}>{liked ? "❤️" : "🤍"}</span>
                                                    <span className="tabular-nums">{likeCount}</span>
                                                </button>
                                                <button onClick={() => toggleComments(post._id)} className={`act-btn ${cmtOpen ? "!text-white/50" : ""}`}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                    <span className="tabular-nums">{cmtCount}</span>
                                                </button>
                                                <button onClick={() => handleToggleBookmark(post._id)} className={`act-btn ${bookmarked ? "bookmarked" : ""}`} title="Bookmark">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                                                </button>
                                                <button onClick={() => handleShare(post._id)} className="act-btn" title="Copy link & share">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                                                    {post.shares > 0 && <span className="tabular-nums">{post.shares}</span>}
                                                </button>
                                                <span className="text-white/8 text-[9px] ml-auto hidden sm:inline tabular-nums">
                                                    {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </span>
                                            </div>

                                            {/* Comments */}
                                            <div className={`cmts-wrap ${cmtOpen ? "open" : ""}`}>
                                                <div className="pt-3 mt-2.5 border-t border-white/[0.03]">
                                                    <div className="flex gap-2.5 mb-3">
                                                        <Avatar name={authUser?.name} avatar={authUser?.avatar} size={26} />
                                                        <div className="flex-1 flex gap-1.5">
                                                            <input type="text" placeholder="Reply…" value={commentInputs[post._id] || ""}
                                                                onChange={e => setCommentInputs(p => ({ ...p, [post._id]: e.target.value }))}
                                                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddComment(post._id); } }}
                                                                className="f-input !py-2 !px-3 !text-[12px] !rounded-xl" />
                                                            <button onClick={() => handleAddComment(post._id)} disabled={commentingPostId === post._id || !commentInputs[post._id]?.trim()}
                                                                className="flex-shrink-0 px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-white/[0.04] text-white/25 hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] disabled:opacity-30 border border-white/[0.04] transition">
                                                                {commentingPostId === post._id ? "…" : "→"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {cmtCount > 0 ? post.comments.map((c, i) => (
                                                            <div key={c._id || i} className="cmt-card flex gap-2.5">
                                                                <Avatar name={c.user?.name} avatar={c.user?.avatar} size={22} />
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px]"><span className="text-white/50 font-medium">{c.user?.name || "Unknown"}</span> <span className="text-white/15">@{c.user?.username}</span></p>
                                                                    <p className="text-white/45 text-[12px] leading-snug">{c.text}</p>
                                                                </div>
                                                            </div>
                                                        )) : <p className="text-white/12 text-[11px] text-center py-1.5">No comments yet</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ════════════ RIGHT SIDEBAR ════════════ */}
                        <aside className="hidden lg:block w-[340px] flex-shrink-0 space-y-5 sticky top-[72px] self-start max-h-[calc(100vh-90px)] overflow-y-auto no-scrollbar">

                            {/* ── Online Users ── */}
                            {onlineUsers.length > 0 && (
                                <div className="glass-sidebar p-5 fade-in" style={{ animationDelay: '.08s' }}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="online-dot" />
                                        <h3 className="text-white/60 text-[12px] font-bold tracking-wider uppercase">Online Now</h3>
                                        <span className="text-white/20 text-[11px] ml-auto">{onlineUsers.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {onlineUsers.slice(0, 12).map(uid => (
                                            <div key={uid} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/10 border border-white/[0.06] flex items-center justify-content-center" title={uid}>
                                                <span className="text-white/40 text-[9px] font-bold w-full text-center">●</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Activity Stats ── */}
                            <div className="glass-sidebar p-6 fade-in" style={{ animationDelay: '.1s' }}>
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/10 flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                                    </div>
                                    <h3 className="text-white/60 text-[12px] font-bold tracking-wider uppercase">Campus Pulse</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.04]">
                                        <p className="text-white/85 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{posts.length}</p>
                                        <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Posts</p>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#FF6B6B]/[0.04] to-transparent border border-[#FF6B6B]/[0.06]">
                                        <p className="text-[#FF6B6B]/90 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{totalLikes}</p>
                                        <p className="text-[#FF6B6B]/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Likes</p>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#6C63FF]/[0.04] to-transparent border border-[#6C63FF]/[0.06]">
                                        <p className="text-[#6C63FF]/90 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{totalComments}</p>
                                        <p className="text-[#6C63FF]/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Replies</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Who to Follow ── */}
                            {suggestions.length > 0 && (
                                <div className="glass-sidebar p-6 fade-in" style={{ animationDelay: '.15s' }}>
                                    <h3 className="text-white/60 text-[12px] font-bold tracking-wider uppercase mb-4">Who to Follow</h3>
                                    <div className="space-y-3">
                                        {suggestions.slice(0, 4).map(user => (
                                            <div key={user._id} className="flex items-center gap-3">
                                                <Link to={`/user/${user.username}`}>
                                                    <Avatar name={user.name} avatar={user.avatar} size={36} online={isOnline(user._id)} />
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <Link to={`/user/${user.username}`} className="text-white/70 text-[13px] font-semibold hover:text-white transition truncate block">{user.name}</Link>
                                                    <p className="text-white/20 text-[11px] truncate">@{user.username}</p>
                                                </div>
                                                <Link to={`/user/${user.username}`} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/15 hover:bg-[#6C63FF]/20 transition">
                                                    View
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Trending Categories ── */}
                            <div className="glass-sidebar p-6 fade-in" style={{ animationDelay: '.2s' }}>
                                <h3 className="text-white/60 text-[12px] font-bold tracking-wider uppercase mb-4">🔥 Trending</h3>
                                <div className="space-y-1">
                                    {categories.filter(c => catStats[c] > 0).sort((a, b) => (catStats[b] || 0) - (catStats[a] || 0)).slice(0, 5).map((c) => (
                                        <button key={c} onClick={() => setFilterCategory(c)} className="trend-item w-full flex items-center gap-3 text-left group">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: catCfg[c]?.bg, border: `1px solid ${catCfg[c]?.b}` }}>{catCfg[c]?.emoji}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white/60 text-[13px] font-semibold group-hover:text-white/80 transition">{c}</p>
                                                <p className="text-white/20 text-[11px]">{catStats[c]} post{catStats[c] > 1 ? "s" : ""}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Profile Card ── */}
                            <div className="fade-in" style={{ animationDelay: '.25s' }}>
                                <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#6C63FF]/20 via-[#A78BFA]/10 to-[#00D4AA]/10">
                                    <div className="glass-sidebar !border-0 p-5">
                                        <div className="flex items-center gap-3.5 mb-4">
                                            <Avatar name={authUser?.name} avatar={authUser?.avatar} size={46} online={isOnline(authUser?._id)} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white/80 text-[14px] font-bold truncate">{authUser?.name}</p>
                                                <p className="text-[#6C63FF]/50 text-[12px] truncate">@{authUser?.username}</p>
                                            </div>
                                        </div>
                                        <p className="text-white/30 text-[12px] leading-relaxed mb-4">{authUser?.bio || "Hey there! I'm on CampusConnect."}</p>
                                        <Link to="/profile" className="block text-center py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF]/10 to-[#00D4AA]/5 border border-[#6C63FF]/10 text-[#6C63FF]/70 hover:text-[#6C63FF] hover:border-[#6C63FF]/20 text-[12px] font-bold transition-all" style={{ fontFamily: "'Syne'" }}>
                                            View Profile →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* ── Footer ── */}
                            <div className="px-4 pt-2 pb-4 fade-in" style={{ animationDelay: '.3s' }}>
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-4 h-4 rounded flex items-center justify-center text-[7px] font-bold text-white" style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA)" }}>C</div>
                                    <span className="text-white/15 text-[10px] font-semibold">CampusConnect</span>
                                </div>
                                <p className="text-white/8 text-[10px] leading-relaxed">© 2026 CampusConnect. Built for students, by students.</p>
                            </div>
                        </aside>

                    </div>
                </div>
            </div>

            {/* Story Modal */}
            {storyModal && (
                <div className="lightbox-overlay" onClick={() => setStoryModal(null)}>
                    <div className="text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4 justify-center">
                            <Avatar name={storyModal.author.name} avatar={storyModal.author.avatar} size={40} />
                            <div>
                                <p className="text-white font-bold text-sm">{storyModal.author.name}</p>
                                <p className="text-white/40 text-xs">@{storyModal.author.username}</p>
                            </div>
                        </div>
                        {storyModal.stories.map((s, i) => (
                            <div key={s._id} className="mb-4">
                                {s.media?.length > 0 ? (
                                    s.media[0].type === "video" ?
                                        <video src={s.media[0].url} controls style={{ maxWidth: "80vw", maxHeight: "60vh", borderRadius: 16 }} /> :
                                        <img src={s.media[0].url} alt="" style={{ maxWidth: "80vw", maxHeight: "60vh", borderRadius: 16 }} />
                                ) : null}
                                <p className="text-white/70 text-sm mt-3 max-w-md mx-auto">{s.content}</p>
                                <p className="text-white/20 text-xs mt-1">{timeAgo(s.createdAt)}</p>
                            </div>
                        ))}
                        <button onClick={() => setStoryModal(null)} className="mt-4 px-6 py-2 rounded-full bg-white/10 text-white/60 text-sm hover:bg-white/20 transition">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Feed;