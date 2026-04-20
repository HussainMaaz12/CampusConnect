import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

/* ─────────────────────────────────────────
   UNIFIED PALETTE:
   Primary:   #6C63FF (electric indigo)
   Secondary: #00D4AA (mint teal)
   Warm:      #FF6B6B (coral rose)
   Gold:      #FFD93D (amber gold)
   BG:        #0A0A0F (deep space)
   ✅ Performance: no backdrop-filter, RAF cursor, transform-only anims
───────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

:root {
  --indigo:  #6C63FF;
  --teal:    #00D4AA;
  --coral:   #FF6B6B;
  --gold:    #FFD93D;
  --violet:  #A78BFA;
  --bg:      #0A0A0F;
}
*, *::before, *::after { box-sizing: border-box; }

.lp { font-family: 'DM Sans', sans-serif; background: var(--bg); color: #fff; overflow-x: hidden; cursor: none; scroll-behavior: smooth; }
.lp h1, .lp h2, .lp h3 { font-family: 'Syne', sans-serif; }

/* ── CURSOR — transform only, RAF-driven ── */
.cc-dot {
  width: 8px; height: 8px;
  background: var(--indigo);
  border-radius: 50%;
  position: fixed; top: 0; left: 0;
  z-index: 9999; pointer-events: none;
  will-change: transform;
}
.cc-ring {
  width: 28px; height: 28px;
  border: 1.5px solid rgba(0,212,170,0.6);
  border-radius: 50%;
  position: fixed; top: 0; left: 0;
  z-index: 9998; pointer-events: none;
  will-change: transform;
}

/* ── AURORA — smooth, no filter animation ── */
.aurora {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 65% at 12% 8%,   rgba(108,99,255,0.15)  0%, transparent 55%),
    radial-gradient(ellipse 65% 50% at 88% 12%,  rgba(0,212,170,0.12)   0%, transparent 55%),
    radial-gradient(ellipse 55% 48% at 52% 82%,  rgba(167,139,250,0.10) 0%, transparent 55%),
    radial-gradient(ellipse 38% 32% at 28% 52%,  rgba(255,217,61,0.04)  0%, transparent 55%),
    var(--bg);
}

/* ── NOISE ── */
.noise {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── DOT GRID ── */
.dotgrid {
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* ── GRADIENT TEXTS ── */
.gt-fire {
  background: linear-gradient(110deg,#6C63FF 0%,#00D4AA 55%,#6C63FF 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shine 3s linear infinite;
}
.gt-cyber {
  background: linear-gradient(110deg,#00D4AA 0%,#FFD93D 55%,#00D4AA 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: shine 4s linear infinite reverse;
}
.gt-vibe {
  background: linear-gradient(110deg,#A78BFA 0%,#FF6B6B 45%,#6C63FF 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
@keyframes shine { to { background-position: 200% center; } }

/* ── GLASS — NO backdrop-filter ── */
.glass      { background: rgba(14,14,20,0.88);  border: 1px solid rgba(255,255,255,0.06); box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); }
.glass-ind  { background: rgba(15,12,30,0.88);  border: 1px solid rgba(108,99,255,0.20);  box-shadow: 0 0 28px rgba(108,99,255,0.08); }
.glass-teal { background: rgba(4,20,22,0.88);   border: 1px solid rgba(0,212,170,0.18);   box-shadow: 0 0 28px rgba(0,212,170,0.06); }
.glass-coral{ background: rgba(20,10,10,0.88);   border: 1px solid rgba(255,107,107,0.18); }

/* ── GRADIENT BORDER HOVER ── */
.gb-card { position: relative; border-radius: 24px; }
.gb-card::before {
  content: ''; position: absolute; inset: -1px; border-radius: 25px; z-index: -1;
  background: linear-gradient(135deg, var(--indigo), var(--teal), var(--violet));
  opacity: 0; transition: opacity 0.3s;
}
.gb-card:hover::before { opacity: 1; }

/* ── BUTTONS ── */
.btn-fire {
  background: linear-gradient(115deg,#6C63FF,#00D4AA);
  border: none; border-radius: 100px; padding: 14px 30px; color: #fff;
  font-weight: 700; font-size: 15px; font-family: 'DM Sans',sans-serif;
  cursor: pointer; position: relative; overflow: hidden;
  will-change: transform;
  transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s;
  box-shadow: 0 6px 28px rgba(108,99,255,0.35);
  text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
}
.btn-fire::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 55%);
  opacity: 0; transition: opacity 0.2s;
}
.btn-fire:hover::after { opacity: 1; }
.btn-fire:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 44px rgba(108,99,255,0.45); }

.btn-ghost {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10);
  border-radius: 100px; padding: 14px 30px; color: rgba(255,255,255,0.85);
  font-weight: 600; font-size: 15px; font-family: 'DM Sans',sans-serif;
  cursor: pointer; will-change: transform;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
}
.btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(108,99,255,0.35); transform: translateY(-2px); }

/* ── STICKERS ── */
.stk { position: absolute; pointer-events: none; user-select: none; will-change: transform; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }
.stk-float  { animation: sFloat  5s ease-in-out infinite; }
.stk-floatr { animation: sFloatR 6s ease-in-out infinite; }
.stk-spin   { animation: sSpin  16s linear infinite; }
.stk-wobble { animation: sWobble 4.5s ease-in-out infinite; }
@keyframes sFloat  { 0%,100%{ transform: translateY(0)    rotate(-7deg) } 50%{ transform: translateY(-16px) rotate(7deg) } }
@keyframes sFloatR { 0%,100%{ transform: translateY(-8px) rotate(5deg) }  50%{ transform: translateY(8px)  rotate(-5deg) } }
@keyframes sSpin   { to { transform: rotate(360deg); } }
@keyframes sWobble { 0%,100%{ transform: scale(1) rotate(0) } 30%{ transform: scale(1.08) rotate(-5deg) } 70%{ transform: scale(0.95) rotate(5deg) } }

/* ── NOTIFICATION POPS ── */
.npop {
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}
.npop-1 { animation: npopIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.7s forwards, npopFloat 5s ease-in-out infinite 1.3s; }
.npop-2 { animation: npopIn 0.5s cubic-bezier(0.16,1,0.3,1) 1.8s forwards, npopFloat 5s ease-in-out infinite 2.4s; }
@keyframes npopIn    { to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes npopFloat { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-7px); } }

/* ── FADE-UPS ── */
.fu  { opacity: 0; transform: translateY(28px); animation: fu 0.65s ease forwards; }
.fu1 { animation-delay: 0.05s; } .fu2 { animation-delay: 0.17s; } .fu3 { animation-delay: 0.30s; }
.fu4 { animation-delay: 0.43s; } .fu5 { animation-delay: 0.56s; }
@keyframes fu { to { opacity: 1; transform: translateY(0); } }

.slr { opacity: 0; transform: translateX(48px); animation: slr 0.85s cubic-bezier(0.16,1,0.3,1) 0.22s forwards; will-change: transform, opacity; }
@keyframes slr { to { opacity: 1; transform: translateX(0); } }

/* ── LIVE PULSE ── */
.live-p { animation: liveP 2.2s ease-in-out infinite; }
@keyframes liveP {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,212,170,0.55); }
  50%     { box-shadow: 0 0 0 5px rgba(0,212,170,0); }
}

/* ── TICKER ── */
.ticker-wrap { overflow: hidden; mask-image: linear-gradient(90deg,transparent,black 10%,black 90%,transparent); -webkit-mask-image: linear-gradient(90deg,transparent,black 10%,black 90%,transparent); }
.ticker   { display: flex; gap: 2.5rem; animation: tick 22s linear infinite; white-space: nowrap; will-change: transform; }
.ticker-r { animation-direction: reverse; }
@keyframes tick { to { transform: translateX(-50%); } }

/* ── FEATURE CARD ── */
.feat-c { border-radius: 24px; padding: 28px; will-change: transform; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s; cursor: default; }
.feat-c:hover { transform: translateY(-7px); }
.feat-c.f1:hover { box-shadow: 0 22px 60px rgba(108,99,255,0.15); }
.feat-c.f2:hover { box-shadow: 0 22px 60px rgba(0,212,170,0.12); }
.feat-c.f3:hover { box-shadow: 0 22px 60px rgba(255,107,107,0.12); }

/* ── AVATARS ── */
.av    { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.av-pk { background: linear-gradient(135deg,#6C63FF,#A78BFA); color: #fff; box-shadow: 0 0 0 2px rgba(108,99,255,0.35); }
.av-cy { background: linear-gradient(135deg,#00D4AA,#6C63FF); color: #fff; box-shadow: 0 0 0 2px rgba(0,212,170,0.35); }
.av-vo { background: linear-gradient(135deg,#FFD93D,#00D4AA); color: #000; box-shadow: 0 0 0 2px rgba(255,217,61,0.35); }

/* ── POST / STAT HOVER ── */
.post-c { will-change: transform; transition: transform 0.2s ease; }
.post-c:hover { transform: scale(1.012); }
.stat-c { will-change: transform; transition: transform 0.25s ease; }
.stat-c:hover { transform: scale(1.06); }

/* ── PILL TAGS ── */
.tag-pk { background: rgba(108,99,255,0.10); border: 1px solid rgba(108,99,255,0.25); color: #A78BFA; }
.tag-cy { background: rgba(0,212,170,0.08);  border: 1px solid rgba(0,212,170,0.22);  color: #00D4AA; }
.tag-vo { background: rgba(255,217,61,0.08); border: 1px solid rgba(255,217,61,0.22); color: #FFD93D; }
.tag-vi { background: rgba(167,139,250,0.10); border: 1px solid rgba(167,139,250,0.22); color: #A78BFA; }

/* ── CTA ── */
.cta-wrap {
  background: linear-gradient(135deg, rgba(108,99,255,0.06) 0%, rgba(167,139,250,0.06) 50%, rgba(0,212,170,0.05) 100%);
  border: 1px solid rgba(255,255,255,0.06);
  position: relative; overflow: hidden; border-radius: 28px;
}
.cta-wrap::before {
  content: ''; position: absolute; top: -70%; left: 50%; transform: translateX(-50%);
  width: 480px; height: 280px; pointer-events: none;
  background: radial-gradient(ellipse, rgba(108,99,255,0.10) 0%, transparent 70%);
}

/* ── SCROLL CUE ── */
.scroll-b { animation: scB 2.2s ease-in-out infinite; will-change: transform; }
@keyframes scB { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(8px); } }
`;

/* ── DATA ─────────────────── */
const features = [
    {
        emoji: "📡", cardCls: "glass-ind feat-c f1 gb-card", tag: "tag-pk", tagLbl: "Real-time", col: "#A78BFA",
        title: "Campus Feed", desc: "Share updates, moments, photos & videos around your college. The campus convo never sleeps."
    },
    {
        emoji: "⚡", cardCls: "glass-teal feat-c f2 gb-card", tag: "tag-cy", tagLbl: "Interactive", col: "#00D4AA",
        title: "Stories & Media", desc: "Post photos, videos, and 24h stories. React with likes, comment hard, and share with your circle."
    },
    {
        emoji: "🎓", cardCls: "glass-coral feat-c f3 gb-card", tag: "tag-vo", tagLbl: "Identity", col: "#FFD93D",
        title: "Student Profiles", desc: "Your campus identity, your way. Showcases posts, followers, and online status — all in one place."
    },
];

const stats = [
    { num: "01", lbl: "Feed", cls: "gt-fire" },
    { num: "02", lbl: "Stories", cls: "gt-cyber" },
    { num: "03", lbl: "Profiles", cls: "gt-vibe" },
    { num: "04", lbl: "Real-time", cls: "gt-fire" },
];

const proofStats = [
    { emoji: "🎯", stat: "500+", lbl: "Students Active", cls: "gt-fire" },
    { emoji: "💬", stat: "2.4K+", lbl: "Posts Dropped", cls: "gt-cyber" },
    { emoji: "🔥", stat: "98%", lbl: "Would Recommend", cls: "gt-vibe" },
];

const tkA = ["Campus Feed 🔥", "Drop a Post ✨", "Find Your People 💜", "Real Talk 💬", "Hack it 🛠️", "Vibe Check ⚡", "Join the Club 🎓", "Stay Wired 📡",
    "Campus Feed 🔥", "Drop a Post ✨", "Find Your People 💜", "Real Talk 💬", "Hack it 🛠️", "Vibe Check ⚡", "Join the Club 🎓", "Stay Wired 📡"];
const tkB = ["CampusConnect 🌐", "Like · Comment · Share 💥", "Stories 📸", "No Cap 🧢", "Built Different 🏗️", "Your Feed Your Rules 🎯", "Go Off 🚀", "W Platform 🏆",
    "CampusConnect 🌐", "Like · Comment · Share 💥", "Stories 📸", "No Cap 🧢", "Built Different 🏗️", "Your Feed Your Rules 🎯", "Go Off 🚀", "W Platform 🏆"];

/* ── CURSOR LERP (RAF) ─────── */
function initCursor() {
    if (typeof window === "undefined") return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    let dot, ring, started = false;

    const tick = () => {
        if (!dot) dot = document.getElementById("ccdot");
        if (!ring) ring = document.getElementById("ccring");
        rx += (mx - rx) * 0.14;
        ry += (my - ry) * 0.14;
        if (dot) dot.style.transform = `translate3d(${mx - 4}px,${my - 4}px,0)`;
        if (ring) ring.style.transform = `translate3d(${rx - 14}px,${ry - 14}px,0)`;
        requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", (e) => {
        mx = e.clientX; my = e.clientY;
        if (!started) { started = true; requestAnimationFrame(tick); }
    }, { passive: true });
}

/* ── TILT (RAF + passive) ──── */
let tiltFrame = null;
function onTilt(e) {
    const el = e.currentTarget;
    const cx = e.clientX, cy = e.clientY;
    if (tiltFrame) cancelAnimationFrame(tiltFrame);
    tiltFrame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (cx - r.left) / r.width - 0.5;
        const y = (cy - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale3d(1.02,1.02,1.02)`;
    });
}
function offTilt(e) {
    if (tiltFrame) cancelAnimationFrame(tiltFrame);
    e.currentTarget.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
}

initCursor();

/* ── COMPONENT ─────────────── */
function Landing() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="lp dotgrid">
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* Cursor elements */}
            <div id="ccdot" className="cc-dot" />
            <div id="ccring" className="cc-ring" />

            {/* Static layers */}
            <div className="aurora" />
            <div className="noise" />

            <Navbar />

            {/* ══════════ HERO ══════════ */}
            <section className="relative min-h-[92vh] flex items-center" style={{ zIndex: 2 }}>

                {/* Stickers */}
                <span className="stk stk-float" style={{ top: "10%", left: "3%", fontSize: "2.4rem", animationDelay: "0s" }}>🚀</span>
                <span className="stk stk-floatr" style={{ top: "8%", right: "5%", fontSize: "2rem", animationDelay: "0.5s" }}>✨</span>
                <span className="stk stk-wobble" style={{ top: "22%", right: "2%", fontSize: "2.4rem", animationDelay: "1s" }}>🔥</span>
                <span className="stk stk-spin" style={{ bottom: "28%", left: "2%", fontSize: "1.7rem", animationDelay: "0.3s" }}>⭐</span>
                <span className="stk stk-floatr" style={{ bottom: "14%", right: "4%", fontSize: "2rem", animationDelay: "0.8s" }}>💜</span>
                <span className="stk stk-float" style={{ bottom: "10%", left: "10%", fontSize: "1.5rem", animationDelay: "0.2s" }}>🎯</span>

                <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full pt-20 pb-16">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* LEFT */}
                        <div>
                            <div className="fu fu1 inline-flex items-center gap-2.5 rounded-full tag-pk px-4 py-2 text-xs font-bold tracking-widest uppercase mb-7">
                                <span className="live-p w-2 h-2 rounded-full inline-block" style={{ background: "#00D4AA" }} />
                                Built for Gen Z · Campus Edition
                            </div>

                            <h1 className="fu fu2 text-[3rem] sm:text-[4.2rem] lg:text-[4.5rem] font-extrabold leading-[1.02] tracking-tight mb-5">
                                <span className="text-white">Your Campus.</span><br />
                                <span className="gt-fire">Your Feed.</span><br />
                                <span className="gt-cyber">Your Vibe.</span>
                            </h1>

                            <p className="fu fu3 text-white/50 text-[15px] leading-relaxed mb-8 max-w-[420px]">
                                CampusConnect is where students drop updates, share photos & videos,
                                discover clubs, and build their digital campus identity — no cap.
                            </p>

                            <div className="fu fu4 flex flex-wrap gap-3 mb-10">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/register" className="btn-fire">Join Now 🔥</Link>
                                        <Link to="/login" className="btn-ghost">Sign in →</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/feed" className="btn-fire">Go to Feed 🚀</Link>
                                        <Link to="/profile" className="btn-ghost">View Profile</Link>
                                    </>
                                )}
                            </div>

                            {/* Social proof */}
                            <div className="fu fu4 flex items-center gap-3 mb-10">
                                <div className="flex -space-x-2">
                                    {[["MD", "av-pk"], ["TC", "av-cy"], ["SR", "av-vo"], ["RK", "av-pk"]].map(([init, cls], n) => (
                                        <div key={n} className={`av ${cls}`} style={{ border: "2px solid #0A0A0F", zIndex: 4 - n }}>{init}</div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm font-bold">500+ students already in 👀</p>
                                    <p className="text-white/35 text-xs">Be part of the campus movement</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="fu fu5 grid grid-cols-4 gap-2.5">
                                {stats.map(s => (
                                    <div key={s.num} className="stat-c glass rounded-2xl p-3.5 text-center cursor-default">
                                        <p className={`text-xl font-extrabold leading-none mb-1 ${s.cls}`}>{s.num}</p>
                                        <p className="text-white/30 text-[10px] leading-tight">{s.lbl}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT — tilt card */}
                        <div className="slr relative"
                            style={{ transformStyle: "preserve-3d", transition: "transform 0.1s linear", willChange: "transform" }}
                            onMouseMove={onTilt}
                            onMouseLeave={offTilt}>

                            {/* Static glow blobs */}
                            <div className="absolute -top-14 -left-14 w-56 h-56 rounded-full pointer-events-none"
                                style={{ background: "radial-gradient(circle,rgba(108,99,255,0.14) 0%,transparent 70%)" }} />
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
                                style={{ background: "radial-gradient(circle,rgba(0,212,170,0.12) 0%,transparent 70%)" }} />

                            {/* Notification pops */}
                            <div className="npop npop-1 absolute -top-4 -right-3 glass-ind rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 z-20"
                                style={{ minWidth: 206 }}>
                                <div className="av av-cy" style={{ width: 28, height: 28, fontSize: 11 }}>NK</div>
                                <div>
                                    <p className="text-white/85 text-xs font-bold">Neha K. liked your post ❤️</p>
                                    <p className="text-white/35 text-[10px]">just now</p>
                                </div>
                            </div>

                            <div className="npop npop-2 absolute -bottom-4 -left-3 glass-teal rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 z-20"
                                style={{ minWidth: 216 }}>
                                <div className="av av-vo" style={{ width: 28, height: 28, fontSize: 11 }}>RK</div>
                                <div>
                                    <p className="text-white/85 text-xs font-bold">Rahul: "W post fr 🔥"</p>
                                    <p className="text-white/35 text-[10px]">2s ago</p>
                                </div>
                            </div>

                            {/* Feed card */}
                            <div className="glass rounded-3xl p-5 relative z-10"
                                style={{ boxShadow: "0 0 44px rgba(108,99,255,0.10)" }}>

                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <span className="live-p w-2 h-2 rounded-full inline-block" style={{ background: "#00D4AA" }} />
                                        <span className="text-white/45 text-xs font-bold tracking-widest uppercase">Live Feed</span>
                                    </div>
                                    <span className="tag-pk rounded-full px-2.5 py-0.5 text-[10px] font-bold">🔥 Trending</span>
                                </div>

                                {/* Post 1 */}
                                <div className="post-c glass-ind rounded-2xl p-4 mb-3">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="av av-pk">MD</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-white">Maaz Dev</p>
                                                    <p className="text-[11px] text-white/35">@maazdev · 2m ago</p>
                                                </div>
                                                <span className="tag-pk rounded-full px-2 py-0.5 text-[10px] font-bold">New ✨</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-white/75 text-sm leading-relaxed mb-3">
                                        Just launched CampusConnect 🚀 The campus finally has its own social platform. No cap this slaps!!
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <button className="flex items-center gap-1 text-[11px] font-bold rounded-xl px-2.5 py-1.5" style={{ background: "rgba(108,99,255,0.12)", color: "#A78BFA" }}>❤️ 24</button>
                                        <button className="flex items-center gap-1 text-[11px] text-white/40 rounded-xl px-2.5 py-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>💬 7</button>
                                        <button className="flex items-center gap-1 text-[11px] text-white/40 rounded-xl px-2.5 py-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>🔁 3</button>
                                        <button className="ml-auto text-[11px] rounded-xl px-2.5 py-1.5" style={{ background: "rgba(0,212,170,0.10)", color: "#00D4AA" }}>↗ Share</button>
                                    </div>
                                </div>

                                {/* Post 2 */}
                                <div className="post-c glass-teal rounded-2xl p-4 mb-3">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="av av-cy">TC</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-white">Tech Club</p>
                                                    <p className="text-[11px] text-white/35">@techclub · 10m ago</p>
                                                </div>
                                                <span className="tag-cy rounded-full px-2 py-0.5 text-[10px] font-bold">Event 🛠️</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-white/75 text-sm leading-relaxed mb-3">
                                        Hackathon regs OPEN 🛠️ 48 hours to build something insane. You coming or nah?
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <button className="flex items-center gap-1 text-[11px] font-bold rounded-xl px-2.5 py-1.5" style={{ background: "rgba(108,99,255,0.12)", color: "#A78BFA" }}>❤️ 41</button>
                                        <button className="flex items-center gap-1 text-[11px] text-white/40 rounded-xl px-2.5 py-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>💬 13</button>
                                        <button className="ml-auto text-[11px] rounded-xl px-2.5 py-1.5" style={{ background: "rgba(0,212,170,0.10)", color: "#00D4AA" }}>↗ Share</button>
                                    </div>
                                </div>

                                {/* Teaser */}
                                <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3">
                                    <div className="av av-vo" style={{ width: 28, height: 28, fontSize: 11 }}>SR</div>
                                    <p className="text-white/35 text-xs flex-1">Sarah dropped a Design Club event…</p>
                                    <span className="gt-fire text-xs font-bold" style={{ cursor: "pointer" }}>View →</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Scroll cue */}
                <div className="scroll-b absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-25 pointer-events-none">
                    <span className="text-[9px] text-white/40 tracking-widest uppercase">Scroll</span>
                    <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
                        <path d="M7 0v14M1 9l6 8 6-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </section>

            {/* ══════════ TICKER ══════════ */}
            <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.5),rgba(0,212,170,0.5),transparent)" }} />

                <div className="py-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.015)" }}>
                    <div className="ticker-wrap">
                        <div className="ticker">
                            {tkA.map((t, i) => (
                                <span key={i} className="text-[11px] font-bold tracking-widest uppercase text-white/20 flex items-center gap-5 flex-shrink-0">
                                    {t}
                                    <span style={{ width: 4, height: 4, background: "var(--indigo)", borderRadius: "50%", display: "inline-block", opacity: 0.7 }} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="py-3 overflow-hidden" style={{ background: "rgba(0,212,170,0.01)" }}>
                    <div className="ticker-wrap">
                        <div className="ticker ticker-r">
                            {tkB.map((t, i) => (
                                <span key={i} className="text-[11px] font-bold tracking-widest uppercase text-white/18 flex items-center gap-5 flex-shrink-0">
                                    {t}
                                    <span style={{ width: 4, height: 4, background: "var(--teal)", borderRadius: "50%", display: "inline-block", opacity: 0.7 }} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,170,0.35),rgba(167,139,250,0.35),transparent)" }} />
            </div>

            {/* ══════════ FEATURES ══════════ */}
            <section className="relative py-28" style={{ zIndex: 2 }}>
                <span className="stk stk-float" style={{ top: "4%", right: "2%", fontSize: "2rem", animationDelay: "1s" }}>🌐</span>
                <span className="stk stk-wobble" style={{ bottom: "4%", left: "1.5%", fontSize: "1.7rem", animationDelay: "0.4s" }}>💥</span>

                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 tag-vi rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-5">
                            ⚡ Why CampusConnect?
                        </span>
                        <h2 className="text-[2.4rem] sm:text-[3rem] font-extrabold leading-tight mb-4">
                            Designed for
                            <span className="gt-fire"> student </span>
                            <span className="gt-cyber">communities</span>
                        </h2>
                        <p className="text-white/40 max-w-lg mx-auto text-[15px] leading-relaxed">
                            Everything for a campus-first social platform — fast, addictive, built for real interactions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div key={i} className={f.cardCls}>
                                <div className="text-4xl mb-5">{f.emoji}</div>
                                <span className={`${f.tag} rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase mb-3 inline-block`}>{f.tagLbl}</span>
                                <div className="text-[10px] font-bold tracking-widest uppercase mb-2.5" style={{ color: f.col, opacity: 0.7 }}>0{i + 1}</div>
                                <h3 className="text-[1.1rem] font-extrabold text-white mb-3">{f.title}</h3>
                                <p className="text-white/42 text-sm leading-relaxed">{f.desc}</p>
                                <div className="mt-6 h-px" style={{ background: `linear-gradient(90deg,transparent,${f.col}55,transparent)` }} />
                            </div>
                        ))}
                    </div>

                    {/* Social proof numbers */}
                    <div className="mt-10 grid sm:grid-cols-3 gap-4 text-center">
                        {proofStats.map((s, i) => (
                            <div key={i} className="glass rounded-2xl py-6 px-4">
                                <p className="text-3xl mb-1">{s.emoji}</p>
                                <p className={`text-[2rem] font-extrabold mb-1 ${s.cls}`}>{s.stat}</p>
                                <p className="text-white/32 text-sm">{s.lbl}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ CTA ══════════ */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-28" style={{ position: "relative", zIndex: 2 }}>
                <span className="stk stk-float" style={{ top: "-16px", right: "9%", fontSize: "2.2rem", animationDelay: "0.6s" }}>🎉</span>
                <span className="stk stk-wobble" style={{ bottom: "-8px", left: "7%", fontSize: "1.7rem", animationDelay: "1.3s" }}>🏆</span>

                <div className="cta-wrap p-10 sm:p-16 text-center">
                    <div className="absolute top-5 left-5 w-3 h-3 rounded-full" style={{ background: "rgba(108,99,255,0.4)" }} />
                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full" style={{ background: "rgba(0,212,170,0.4)" }} />
                    <div className="absolute bottom-5 left-1/2 w-2 h-2 rounded-full" style={{ background: "rgba(255,217,61,0.4)" }} />

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 tag-pk rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                            🚀 Ready to vibe?
                        </span>
                        <h2 className="text-[2.4rem] sm:text-[3rem] font-extrabold leading-tight mb-5">
                            Start building your
                            <span className="gt-fire"> campus</span>
                            <span className="gt-cyber"> presence</span>
                        </h2>
                        <p className="text-white/40 max-w-lg mx-auto mb-10 text-[15px] leading-relaxed">
                            Join CampusConnect — the platform where student life actually happens.
                            Drop posts, go off in comments, find your people.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center mb-8">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/register" className="btn-fire" style={{ fontSize: 16, padding: "15px 34px" }}>Create Account 🔥</Link>
                                    <Link to="/login" className="btn-ghost" style={{ fontSize: 16, padding: "15px 34px" }}>Login →</Link>
                                </>
                            ) : (
                                <Link to="/feed" className="btn-fire" style={{ fontSize: 16, padding: "15px 34px" }}>Continue to Feed 🚀</Link>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-5 text-white/25 text-xs">
                            {["✅ Free forever", "⚡ Instant access", "🔒 Privacy first", "💜 Student built"].map((b, i) => (
                                <span key={i}>{b}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;