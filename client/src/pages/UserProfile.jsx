import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Navbar from "../components/Navbar";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  .up-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; position: relative; }
  .up-root h1,.up-root h2,.up-root h3 { font-family: 'Syne', sans-serif; }
  .up-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: #0A0A0F; }
  .up-bg::before { content:''; position:absolute; inset:0; background:
    radial-gradient(ellipse 50% 40% at 30% 20%, rgba(108,99,255,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 70% 80%, rgba(0,212,170,0.05) 0%, transparent 55%); }
  .up-content { position: relative; z-index: 1; }
  .up-fade { animation: _upFade 0.5s ease forwards; opacity: 0; transform: translateY(12px); }
  @keyframes _upFade { to { opacity: 1; transform: translateY(0); } }

  .up-glass {
    background: rgba(14,14,20,0.85);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 28px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.3);
  }

  .up-banner {
    height: 200px;
    background: linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,212,170,0.1) 40%, rgba(167,139,250,0.08) 100%);
    border-radius: 28px 28px 0 0;
    position: relative;
    overflow: hidden;
  }
  .up-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .up-banner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 30%, rgba(14,14,20,0.95) 100%);
  }

  .up-stat {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 20px;
    padding: 22px 16px;
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .up-stat::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 2px;
    border-radius: 0 0 4px 4px;
    transition: all 0.3s;
    opacity: 0;
  }
  .up-stat:hover {
    border-color: rgba(255,255,255,0.1);
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
  }
  .up-stat:hover::before { opacity: 1; width: 50px; }

  .up-post {
    background: rgba(14,14,22,0.6);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 22px;
    padding: 22px;
    transition: all 0.3s;
  }
  .up-post:hover {
    border-color: rgba(255,255,255,0.08);
    background: rgba(14,14,22,0.8);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .online-dot-lg {
    width: 14px; height: 14px;
    border-radius: 50%;
    background: #00D4AA;
    border: 3px solid #0E0E16;
    box-shadow: 0 0 10px rgba(0,212,170,0.6);
    animation: _onPulse 2s ease infinite;
  }
  @keyframes _onPulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(0,212,170,0.5); } 50%{ box-shadow: 0 0 0 5px rgba(0,212,170,0); } }

  .media-grid-sm { display: grid; gap: 4px; border-radius: 14px; overflow: hidden; }
  .media-grid-sm img, .media-grid-sm video { width: 100%; height: 100%; object-fit: cover; }

  .up-interest-tag {
    font-size: 11px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 10px;
    background: rgba(108,99,255,0.08);
    color: rgba(108,99,255,0.8);
    border: 1px solid rgba(108,99,255,0.12);
    transition: all 0.25s;
  }
  .up-interest-tag:hover {
    background: rgba(108,99,255,0.15);
    border-color: rgba(108,99,255,0.25);
    transform: translateY(-1px);
  }

  .up-social-btn {
    width: 38px; height: 38px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.3);
    transition: all 0.25s;
  }
  .up-social-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 15px rgba(0,0,0,0.3);
  }
`;

const catCfg = {
    General: { emoji: "💬", c: "#a1a1aa" }, Academic: { emoji: "📚", c: "#60a5fa" },
    Events: { emoji: "🎉", c: "#c084fc" }, Clubs: { emoji: "🏛️", c: "#4ade80" },
    "Lost & Found": { emoji: "🔍", c: "#facc15" }, Hostel: { emoji: "🏠", c: "#22d3ee" },
    Confession: { emoji: "🤫", c: "#f472b6" },
};

function timeAgo(d) {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return "just now"; const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function UserProfile() {
    const { username } = useParams();
    const { authUser } = useAuth();
    const { isOnline } = useSocket();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState("");
    const [activePostTab, setActivePostTab] = useState('posts');

    const isOwnProfile = authUser?.username === username;
    const isFollowing = user?.followers?.some(f => (f._id || f) === authUser?._id);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const r = await api.get(`/auth/profile/${username}`);
            if (r.data.success) {
                setUser(r.data.user);
                const pr = await api.get(`/posts/user/${r.data.user._id}`);
                if (pr.data.success) setPosts(pr.data.posts);
            }
        } catch (e) {
            setError("User not found");
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user) return;
        try {
            setFollowLoading(true);
            const r = await api.put(`/auth/follow/${user._id}`);
            if (r.data.success) await fetchProfile();
        } catch (e) {
            setError("Failed to follow/unfollow");
        } finally {
            setFollowLoading(false);
        }
    };

    const totalLikes = posts.reduce((s, p) => s + (p.likes?.length || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments?.length || 0), 0);
    const regularPosts = posts.filter(p => p.postType !== 'story');
    const storyPosts = posts.filter(p => p.postType === 'story');

    useEffect(() => { fetchProfile(); }, [username]);

    if (loading) return (
        <div className="up-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="up-bg" />
            <div className="up-content">
                <Navbar />
                <div className="max-w-[900px] mx-auto px-4 py-24 text-center">
                    <div className="up-glass p-16">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/20 animate-pulse flex items-center justify-center">
                            <span className="text-3xl">⏳</span>
                        </div>
                        <p className="text-white/30 text-sm">Loading profile…</p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !user) return (
        <div className="up-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="up-bg" />
            <div className="up-content">
                <Navbar />
                <div className="max-w-[900px] mx-auto px-4 py-24 text-center">
                    <div className="up-glass p-16">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 bg-white/[0.03] border border-white/5 flex items-center justify-center">
                            <span className="text-4xl">😢</span>
                        </div>
                        <h2 className="text-xl font-extrabold text-white/70 mb-3">User not found</h2>
                        <p className="text-white/30 text-sm mb-6">The profile you're looking for doesn't exist or has been removed.</p>
                        <Link to="/directory" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 hover:bg-[#6C63FF]/20 transition">
                            ← Back to Directory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="up-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="up-bg" />
            <div className="up-content">
                <Navbar />
                <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 pb-20">

                    <div className="up-glass overflow-hidden mb-6 up-fade">
                        <div className="up-banner" />
                        <div className="px-6 sm:px-8 pb-8 -mt-16 relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">

                                <div className="relative">
                                    <div className="rounded-[22px] p-[3px]" style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA, #A78BFA)", boxShadow: "0 0 35px rgba(108,99,255,0.2)" }}>
                                        <div className="w-[110px] h-[110px] rounded-[20px] bg-[#111] flex items-center justify-center overflow-hidden text-4xl font-extrabold text-white" style={{ fontFamily: "'Syne'" }}>
                                            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    </div>
                                    {isOnline(user._id) && <span className="online-dot-lg absolute bottom-1 right-1" />}
                                </div>

                                <div className="flex-1 min-w-0 pb-1">
                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white/95 tracking-tight">{user.name}</h1>
                                        {isOnline(user._id) && (
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(0,212,170,0.10)", color: "#00D4AA", border: "1px solid rgba(0,212,170,0.20)" }}>
                                                ● Online
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[#6C63FF]/60 text-[14px] font-medium">@{user.username}</p>

                                    <p className="text-white/35 text-[13px] mt-3 max-w-lg leading-relaxed">{user.bio || "Hey there! I'm on CampusConnect."}</p>

                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                        {user.department && (
                                            <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(108,99,255,0.08)', color: 'rgba(108,99,255,0.8)', border: '1px solid rgba(108,99,255,0.15)' }}>
                                                🎓 {user.department}
                                            </span>
                                        )}
                                        {user.year && (
                                            <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,212,170,0.08)', color: 'rgba(0,212,170,0.8)', border: '1px solid rgba(0,212,170,0.15)' }}>
                                                📅 Class of {user.year}
                                            </span>
                                        )}
                                    </div>

                                    {user.interests && user.interests.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            {user.interests.map((interest, i) => (
                                                <span key={i} className="up-interest-tag">#{interest}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        {user.socialLinks?.linkedin && (
                                            <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="up-social-btn hover:!bg-[#0077b5]/20 hover:!text-[#0077b5] hover:!border-[#0077b5]/30">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                            </a>
                                        )}
                                        {user.socialLinks?.github && (
                                            <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="up-social-btn hover:!bg-white/10 hover:!text-white hover:!border-white/20">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    {!isOwnProfile && (
                                        <>
                                            <Link to="/chat" state={{ user: user }}
                                                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-white/[0.04] text-white/60 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white flex items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                                Message
                                            </Link>
                                            <button onClick={handleFollow} disabled={followLoading}
                                                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                                style={{
                                                    background: isFollowing ? "rgba(255,255,255,0.05)" : "linear-gradient(115deg, #6C63FF, #00D4AA)",
                                                    color: isFollowing ? "rgba(255,255,255,0.5)" : "#fff",
                                                    border: isFollowing ? "1px solid rgba(255,255,255,0.08)" : "none",
                                                    boxShadow: isFollowing ? "none" : "0 4px 20px rgba(108,99,255,0.3)",
                                                }}
                                            >
                                                {followLoading ? "…" : isFollowing ? "Following ✓" : "Follow +"}
                                            </button>
                                        </>
                                    )}
                                    {isOwnProfile && (
                                        <Link to="/profile" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] transition flex items-center gap-2">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            Edit Profile
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 up-fade" style={{ animationDelay: '.06s' }}>
                        {[
                            { val: regularPosts.length, label: 'Posts', color: '#fff', accent: '#6C63FF' },
                            { val: totalLikes, label: 'Likes', color: '#FF6B6B', accent: '#FF6B6B' },
                            { val: user.followers?.length || 0, label: 'Followers', color: '#6C63FF', accent: '#6C63FF' },
                            { val: user.following?.length || 0, label: 'Following', color: '#00D4AA', accent: '#00D4AA' },
                        ].map((stat, i) => (
                            <div key={i} className="up-stat group">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full transition-all group-hover:w-12" style={{ background: stat.accent, opacity: 0 }}></div>
                                <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: `${stat.color}dd`, fontFamily: "'Syne'" }}>{stat.val}</p>
                                <p className="text-white/25 text-[10px] font-bold mt-1.5 uppercase tracking-[0.15em]">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="up-fade" style={{ animationDelay: '.12s' }}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
                                <button
                                    onClick={() => setActivePostTab('posts')}
                                    className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${activePostTab === 'posts' ? 'bg-[#6C63FF]/15 text-[#6C63FF] shadow-[0_0_10px_rgba(108,99,255,0.1)]' : 'text-white/30 hover:text-white/50'}`}
                                >
                                    Posts ({regularPosts.length})
                                </button>
                                {storyPosts.length > 0 && (
                                    <button
                                        onClick={() => setActivePostTab('stories')}
                                        className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-all ${activePostTab === 'stories' ? 'bg-[#6C63FF]/15 text-[#6C63FF] shadow-[0_0_10px_rgba(108,99,255,0.1)]' : 'text-white/30 hover:text-white/50'}`}
                                    >
                                        Stories ({storyPosts.length})
                                    </button>
                                )}
                            </div>
                            <p className="text-white/15 text-[11px] font-semibold">
                                {totalLikes} likes · {totalComments} comments
                            </p>
                        </div>

                        {(activePostTab === 'posts' ? regularPosts : storyPosts).length === 0 ? (
                            <div className="up-glass p-14 text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                                    <span className="text-3xl">{activePostTab === 'posts' ? '📝' : '📖'}</span>
                                </div>
                                <p className="text-white/30 text-[13px] font-medium">No {activePostTab} yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(activePostTab === 'posts' ? regularPosts : storyPosts).map(post => {
                                    const cat = catCfg[post.category] || catCfg.General;
                                    return (
                                        <div key={post._id} className="up-post group">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: `${cat.c}12`, color: cat.c, border: `1px solid ${cat.c}20` }}>
                                                        {cat.emoji} {post.category}
                                                    </span>
                                                </div>
                                                <span className="text-white/20 text-[10px] font-medium">{timeAgo(post.createdAt)}</span>
                                            </div>
                                            <p className="text-white/60 text-[14px] leading-[1.7] mb-4 whitespace-pre-wrap">{post.content}</p>

                                            {post.media?.length > 0 && (
                                                <div className="media-grid-sm mb-4" style={{ gridTemplateColumns: post.media.length === 1 ? "1fr" : "1fr 1fr", maxHeight: 320 }}>
                                                    {post.media.slice(0, 4).map((m, i) =>
                                                        m.type === "video" ?
                                                            <video key={i} src={m.url} controls style={{ maxHeight: 280 }} /> :
                                                            <img key={i} src={m.url} alt="" style={{ maxHeight: 280 }} />
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-5 text-[11px] text-white/25 pt-3 border-t border-white/[0.04]">
                                                <span className="flex items-center gap-1.5 group-hover:text-white/40 transition">❤️ {post.likes?.length || 0}</span>
                                                <span className="flex items-center gap-1.5 group-hover:text-white/40 transition">💬 {post.comments?.length || 0}</span>
                                                {post.shares > 0 && <span className="flex items-center gap-1.5 group-hover:text-white/40 transition">↗ {post.shares}</span>}
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
    );
}

export default UserProfile;
