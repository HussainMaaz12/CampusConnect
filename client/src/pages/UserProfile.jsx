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
  .up-bg::before { content:''; position:absolute; inset:0; background: radial-gradient(ellipse 50% 40% at 30% 20%, rgba(108,99,255,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(0,212,170,0.05) 0%, transparent 55%); }
  .up-content { position: relative; z-index: 1; }
  .up-glass { background: rgba(14,14,20,0.88); border: 1px solid rgba(255,255,255,0.05); border-radius: 22px; box-shadow: 0 2px 20px rgba(0,0,0,0.15); }
  .up-banner { height: 180px; background: linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(0,212,170,0.08) 50%, rgba(167,139,250,0.06) 100%); border-radius: 22px 22px 0 0; position: relative; overflow: hidden; }
  .up-banner::after { content:''; position:absolute; inset:0; background: linear-gradient(180deg, transparent 40%, rgba(10,10,15,0.8) 100%); }
  .up-fade { animation: _upFade 0.45s ease forwards; opacity: 0; transform: translateY(10px); }
  @keyframes _upFade { to { opacity: 1; transform: translateY(0); } }
  .up-stat { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; padding: 20px; transition: all 0.3s; }
  .up-stat:hover { border-color: rgba(255,255,255,0.08); transform: translateY(-2px); }
  .up-post { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; padding: 20px; transition: all 0.25s; }
  .up-post:hover { border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); }
  .online-dot-lg { width: 12px; height: 12px; border-radius: 50%; background: #00D4AA; border: 3px solid #0A0A0F; box-shadow: 0 0 8px rgba(0,212,170,0.5); }
  .media-grid-sm { display: grid; gap: 3px; border-radius: 12px; overflow: hidden; }
  .media-grid-sm img, .media-grid-sm video { width: 100%; height: 100%; object-fit: cover; }
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

    useEffect(() => { fetchProfile(); }, [username]);

    if (loading) return (
        <div className="up-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="up-bg" />
            <div className="up-content"><Navbar /><div className="max-w-[900px] mx-auto px-4 py-20 text-center"><div className="text-2xl mb-4">⏳</div><p className="text-white/30 text-sm">Loading profile…</p></div></div>
        </div>
    );

    if (error || !user) return (
        <div className="up-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="up-bg" />
            <div className="up-content"><Navbar /><div className="max-w-[900px] mx-auto px-4 py-20 text-center"><div className="text-4xl mb-4">😢</div><p className="text-white/40 text-lg font-bold mb-2">User not found</p><Link to="/feed" className="text-[#6C63FF] text-sm hover:underline">← Back to Feed</Link></div></div>
        </div>
    );

    return (
        <div className="up-root">
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="up-bg" />
            <div className="up-content">
                <Navbar />
                <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 pb-20">

                    {/* Hero Card */}
                    <div className="up-glass overflow-hidden mb-6 up-fade">
                        <div className="up-banner" />
                        <div className="px-6 sm:px-8 pb-7 -mt-16 relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="rounded-full p-[3px]" style={{ background: "linear-gradient(135deg, #6C63FF, #00D4AA, #A78BFA)", boxShadow: "0 0 30px rgba(108,99,255,0.15)" }}>
                                        <div className="w-[110px] h-[110px] rounded-full bg-[#111] flex items-center justify-center overflow-hidden text-4xl font-extrabold text-white" style={{ fontFamily: "'Syne'" }}>
                                            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    </div>
                                    {isOnline(user._id) && <span className="online-dot-lg absolute bottom-1 right-1" />}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 pb-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white/90">{user.name}</h1>
                                        {isOnline(user._id) && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,212,170,0.10)", color: "#00D4AA", border: "1px solid rgba(0,212,170,0.20)" }}>● Online</span>}
                                    </div>
                                    <p className="text-[#6C63FF]/60 text-[14px] font-medium mt-0.5">@{user.username}</p>
                                    <p className="text-white/35 text-[13px] mt-2 max-w-lg">{user.bio || "Hey there! I'm on CampusConnect."}</p>
                                </div>

                                {/* Follow button */}
                                {!isOwnProfile && (
                                    <button onClick={handleFollow} disabled={followLoading}
                                        className="px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                                        style={{
                                            background: isFollowing ? "rgba(255,255,255,0.05)" : "linear-gradient(115deg, #6C63FF, #00D4AA)",
                                            color: isFollowing ? "rgba(255,255,255,0.5)" : "#fff",
                                            border: isFollowing ? "1px solid rgba(255,255,255,0.08)" : "none",
                                            boxShadow: isFollowing ? "none" : "0 4px 16px rgba(108,99,255,0.25)",
                                        }}
                                    >
                                        {followLoading ? "…" : isFollowing ? "Following ✓" : "Follow +"}
                                    </button>
                                )}
                                {isOwnProfile && (
                                    <Link to="/profile" className="px-5 py-2 rounded-full text-sm font-bold bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] transition">
                                        Edit Profile
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3 mb-6 up-fade" style={{ animationDelay: '.06s' }}>
                        <div className="up-stat text-center">
                            <p className="text-white/85 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{posts.length}</p>
                            <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Posts</p>
                        </div>
                        <div className="up-stat text-center">
                            <p className="text-[#FF6B6B]/90 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{totalLikes}</p>
                            <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Likes</p>
                        </div>
                        <div className="up-stat text-center">
                            <p className="text-[#6C63FF]/90 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{user.followers?.length || 0}</p>
                            <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Followers</p>
                        </div>
                        <div className="up-stat text-center">
                            <p className="text-[#00D4AA]/90 text-2xl font-extrabold" style={{ fontFamily: "'Syne'" }}>{user.following?.length || 0}</p>
                            <p className="text-white/25 text-[10px] font-semibold mt-1 uppercase tracking-wider">Following</p>
                        </div>
                    </div>

                    {/* Posts */}
                    <div className="up-fade" style={{ animationDelay: '.12s' }}>
                        <h2 className="text-white/60 text-[14px] font-bold mb-4">Posts by {user.name?.split(" ")[0]}</h2>
                        {posts.length === 0 ? (
                            <div className="up-glass p-10 text-center">
                                <p className="text-3xl mb-2">📝</p>
                                <p className="text-white/25 text-[13px]">No posts yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {posts.map(post => {
                                    const cat = catCfg[post.category] || catCfg.General;
                                    return (
                                        <div key={post._id} className="up-post">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${cat.c}12`, color: cat.c }}>
                                                    {cat.emoji} {post.category}
                                                </span>
                                                <span className="text-white/15 text-[10px]">{timeAgo(post.createdAt)}</span>
                                            </div>
                                            <p className="text-white/55 text-[13px] leading-relaxed mb-3">{post.content}</p>

                                            {/* Media */}
                                            {post.media?.length > 0 && (
                                                <div className={`media-grid-sm mb-3`} style={{ gridTemplateColumns: post.media.length === 1 ? "1fr" : "1fr 1fr", maxHeight: 300 }}>
                                                    {post.media.slice(0, 4).map((m, i) =>
                                                        m.type === "video" ?
                                                            <video key={i} src={m.url} controls style={{ maxHeight: 250 }} /> :
                                                            <img key={i} src={m.url} alt="" style={{ maxHeight: 250 }} />
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-4 text-[11px] text-white/20">
                                                <span className="flex items-center gap-1">❤️ {post.likes?.length || 0}</span>
                                                <span className="flex items-center gap-1">💬 {post.comments?.length || 0}</span>
                                                {post.shares > 0 && <span className="flex items-center gap-1">↗ {post.shares}</span>}
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
