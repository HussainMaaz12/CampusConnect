import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .landing-root {
    font-family: 'DM Sans', sans-serif;
  }

  .landing-root h1,
  .landing-root h2,
  .landing-root h3,
  .landing-root .display {
    font-family: 'Syne', sans-serif;
  }

  /* Animated grid background */
  .grid-bg {
    background-image:
      linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* Glowing orbs */
  .orb-1 {
    background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%);
    animation: orb-float 8s ease-in-out infinite;
  }
  .orb-2 {
    background: radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%);
    animation: orb-float 11s ease-in-out infinite reverse;
  }

  @keyframes orb-float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-30px) scale(1.08); }
  }

  /* Badge pulse */
  .badge-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }

  /* Stagger fade-in */
  .fade-up {
    opacity: 0;
    transform: translateY(28px);
    animation: fadeUp 0.7s ease forwards;
  }
  .fade-up-1 { animation-delay: 0.05s; }
  .fade-up-2 { animation-delay: 0.18s; }
  .fade-up-3 { animation-delay: 0.30s; }
  .fade-up-4 { animation-delay: 0.42s; }
  .fade-up-5 { animation-delay: 0.55s; }

  @keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }

  /* Card slide-in */
  .slide-in {
    opacity: 0;
    transform: translateX(40px);
    animation: slideIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s forwards;
  }
  @keyframes slideIn {
    to { opacity: 1; transform: translateX(0); }
  }

  /* Gradient text */
  .gradient-text {
    background: linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Avatar ring */
  .avatar-ring {
    box-shadow: 0 0 0 2px #f97316, 0 0 0 4px rgba(249,115,22,0.15);
  }

  /* Feature card hover */
  .feature-card {
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-6px);
    border-color: rgba(249,115,22,0.35);
    box-shadow: 0 20px 60px -10px rgba(249,115,22,0.12);
  }

  /* Stat card */
  .stat-card {
    transition: transform 0.25s ease, border-color 0.25s ease;
  }
  .stat-card:hover {
    transform: scale(1.05);
    border-color: rgba(249,115,22,0.4);
  }

  /* Noise overlay */
  .noise {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    background-repeat: repeat;
    pointer-events: none;
  }

  /* Scrolling ticker */
  .ticker-track {
    animation: ticker 18s linear infinite;
    white-space: nowrap;
    display: flex;
    gap: 2rem;
  }
  @keyframes ticker {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* CTA glow button */
  .btn-glow {
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-glow::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-glow:hover::after { opacity: 1; }
  .btn-glow:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(249,115,22,0.45);
  }

  /* Post card */
  .post-card {
    transition: transform 0.25s ease;
  }
  .post-card:hover { transform: scale(1.01); }

  /* Section divider line */
  .divider-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(249,115,22,0.25), transparent);
  }
`;

const features = [
    {
        emoji: "📡",
        title: "Campus Feed",
        description:
            "Share updates, moments, ideas, and events happening around your college in real time. Stay in the loop, always.",
    },
    {
        emoji: "🔥",
        title: "Likes & Comments",
        description:
            "Engage with posts through reactions and threaded discussions that make every conversation feel alive.",
    },
    {
        emoji: "🎓",
        title: "Student Profiles",
        description:
            "Maintain a personal profile, track your activity, and build a campus identity that travels with you.",
    },
];

const stats = [
    { num: "01", label: "Unified Feed" },
    { num: "02", label: "Profiles" },
    { num: "03", label: "Reactions" },
    { num: "04", label: "Comments" },
];

const tickerItems = [
    "Campus Feed", "Live Updates", "Student Profiles", "Real Interactions",
    "Hackathons", "Club Events", "Study Groups", "CampusConnect",
    "Campus Feed", "Live Updates", "Student Profiles", "Real Interactions",
    "Hackathons", "Club Events", "Study Groups", "CampusConnect",
];

function Avatar({ initials, color = "bg-orange-500" }) {
    return (
        <div
            className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-sm font-bold text-black avatar-ring flex-shrink-0`}
        >
            {initials}
        </div>
    );
}

function Landing() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing-root min-h-screen bg-[#080808] text-white overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            {/* Persistent noise layer */}
            <div className="fixed inset-0 noise z-0 opacity-60 pointer-events-none" />

            <Navbar />

            {/* ─── HERO ─── */}
            <section className="relative overflow-hidden grid-bg">
                {/* Glow orbs */}
                <div className="orb-1 absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full pointer-events-none" />
                <div className="orb-2 absolute top-20 right-0 w-[420px] h-[420px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28">
                    <div className="grid lg:grid-cols-2 gap-14 items-center">

                        {/* LEFT */}
                        <div>
                            {/* Badge */}
                            <div className="fade-up fade-up-1 inline-flex items-center gap-2.5 rounded-full border border-orange-500/25 bg-orange-500/8 px-4 py-2 text-sm text-orange-300 mb-7 backdrop-blur-sm">
                                <span className="badge-dot w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                                Built for Modern Campus Communities
                            </div>

                            <h1 className="fade-up fade-up-2 text-[2.6rem] sm:text-[3.6rem] lg:text-[3.8rem] font-extrabold leading-[1.08] tracking-tight mb-6">
                                The Social Platform
                                <span className="block gradient-text mt-1">Made for Students</span>
                            </h1>

                            <p className="fade-up fade-up-3 text-zinc-400 text-lg leading-relaxed mb-9 max-w-xl">
                                CampusConnect is a student-first social platform where college communities
                                share updates, interact through likes and comments, and build a stronger
                                digital campus presence.
                            </p>

                            {/* CTA Buttons */}
                            <div className="fade-up fade-up-4 flex flex-col sm:flex-row gap-3.5 mb-12">
                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/register"
                                            className="btn-glow bg-orange-500 px-7 py-3.5 rounded-2xl text-black font-semibold text-center text-[15px]"
                                        >
                                            Start Connecting →
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="btn-glow bg-white/5 hover:bg-white/10 border border-white/10 transition px-7 py-3.5 rounded-2xl text-white font-semibold text-center text-[15px] backdrop-blur-sm"
                                        >
                                            Login to Continue
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/feed"
                                            className="btn-glow bg-orange-500 px-7 py-3.5 rounded-2xl text-black font-semibold text-center text-[15px]"
                                        >
                                            Go to Feed →
                                        </Link>
                                        <Link
                                            to="/profile"
                                            className="btn-glow bg-white/5 hover:bg-white/10 border border-white/10 transition px-7 py-3.5 rounded-2xl text-white font-semibold text-center text-[15px]"
                                        >
                                            View Profile
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Stats row */}
                            <div className="fade-up fade-up-5 grid grid-cols-4 gap-3">
                                {stats.map((s) => (
                                    <div
                                        key={s.num}
                                        className="stat-card bg-white/[0.03] border border-white/8 rounded-2xl p-3.5 text-center cursor-default"
                                    >
                                        <p className="text-xl font-extrabold gradient-text leading-none mb-1">{s.num}</p>
                                        <p className="text-zinc-500 text-xs leading-tight">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT – mock feed */}
                        <div className="slide-in relative">
                            {/* Decorative corner glows */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/8 blur-3xl rounded-full pointer-events-none" />

                            <div className="relative bg-[#111] border border-white/10 rounded-3xl p-5 shadow-2xl">
                                {/* Header bar */}
                                <div className="flex items-center justify-between mb-5 px-1">
                                    <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">Campus Feed</span>
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Live
                                    </span>
                                </div>

                                {/* Post 1 */}
                                <div className="post-card bg-white/[0.04] border border-white/8 rounded-2xl p-4 mb-3">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Avatar initials="MD" color="bg-orange-500" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-white leading-none">Maaz Dev</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">@maazdev</p>
                                                </div>
                                                <span className="text-[11px] text-zinc-600">2m ago</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-zinc-200 text-sm leading-relaxed mb-4">
                                        Just launched CampusConnect 🚀 The campus finally has its own social platform. Let's gooo!
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/5 hover:bg-orange-500/15 hover:text-orange-400 transition rounded-xl px-3 py-1.5">
                                            ❤️ <span>12</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/5 hover:bg-white/10 transition rounded-xl px-3 py-1.5">
                                            💬 <span>4</span>
                                        </button>
                                        <button className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 bg-white/5 hover:bg-white/10 transition rounded-xl px-3 py-1.5">
                                            ↗ Share
                                        </button>
                                    </div>
                                </div>

                                {/* Post 2 */}
                                <div className="post-card bg-white/[0.04] border border-white/8 rounded-2xl p-4 mb-3">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Avatar initials="TC" color="bg-sky-500" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-white leading-none">Tech Club</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">@techclub</p>
                                                </div>
                                                <span className="text-[11px] text-zinc-600">10m ago</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-zinc-200 text-sm leading-relaxed mb-4">
                                        Hackathon registrations open now — 48 hours to build something impactful. 🛠️
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/5 hover:bg-orange-500/15 hover:text-orange-400 transition rounded-xl px-3 py-1.5">
                                            ❤️ <span>27</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/5 hover:bg-white/10 transition rounded-xl px-3 py-1.5">
                                            💬 <span>9</span>
                                        </button>
                                        <button className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500 bg-white/5 hover:bg-white/10 transition rounded-xl px-3 py-1.5">
                                            ↗ Share
                                        </button>
                                    </div>
                                </div>

                                {/* Post 3 – teaser */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <Avatar initials="SR" color="bg-violet-500" />
                                    <p className="text-zinc-500 text-sm flex-1">Sarah just posted an event in Design Club…</p>
                                    <span className="text-xs text-orange-400 font-medium flex-shrink-0">View →</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── TICKER ─── */}
            <div className="divider-line" />
            <div className="overflow-hidden py-4 bg-[#0a0a0a] border-y border-white/5">
                <div className="ticker-track">
                    {tickerItems.map((item, i) => (
                        <span key={i} className="text-xs font-semibold text-zinc-600 tracking-widest uppercase flex items-center gap-6 flex-shrink-0">
                            {item}
                            <span className="w-1 h-1 rounded-full bg-orange-500/50" />
                        </span>
                    ))}
                </div>
            </div>
            <div className="divider-line" />

            {/* ─── FEATURES ─── */}
            <section className="relative overflow-hidden">
                <div className="orb-2 absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none opacity-50" />

                <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 py-24">
                    {/* Section label */}
                    <div className="text-center mb-16">
                        <span className="inline-block text-orange-400 text-sm font-semibold tracking-widest uppercase mb-4">
                            Why CampusConnect?
                        </span>
                        <h2 className="text-3xl sm:text-[2.8rem] font-extrabold text-white mb-5 leading-tight">
                            Designed for student
                            <span className="gradient-text"> communities</span>
                        </h2>
                        <p className="text-zinc-500 max-w-xl mx-auto text-base leading-relaxed">
                            Everything needed for a campus-first social platform — simple, fast, engaging,
                            and built for real human interaction.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="feature-card group bg-[#0f0f0f] border border-white/8 rounded-3xl p-7 cursor-default"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center text-xl mb-6 group-hover:bg-orange-500/20 transition">
                                    {f.emoji}
                                </div>

                                {/* Number badge */}
                                <span className="text-[11px] font-bold text-orange-500/60 tracking-widest uppercase mb-3 block">
                                    0{i + 1}
                                </span>

                                <h3 className="text-[1.1rem] font-bold text-white mb-3">{f.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>

                                {/* Bottom accent */}
                                <div className="mt-6 h-px bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 group-hover:via-orange-500/50 transition-all duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#141414] to-[#0f0f0f] border border-white/8 rounded-3xl p-10 sm:p-14 text-center">
                    {/* Background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-orange-500/8 blur-3xl pointer-events-none rounded-full" />

                    {/* Grid overlay */}
                    <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none rounded-3xl" />

                    <div className="relative z-10">
                        <span className="inline-block text-orange-400 text-sm font-semibold tracking-widest uppercase mb-5">
                            Ready to experience it?
                        </span>
                        <h2 className="text-3xl sm:text-[2.6rem] font-extrabold text-white mb-5 leading-tight">
                            Start building your
                            <span className="gradient-text"> campus presence</span>
                        </h2>
                        <p className="text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed">
                            Join CampusConnect and explore a modern social platform made for students,
                            clubs, events, and real campus interaction.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/register"
                                        className="btn-glow bg-orange-500 px-8 py-3.5 rounded-2xl text-black font-semibold text-[15px]"
                                    >
                                        Create Account →
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="btn-glow bg-white/5 hover:bg-white/10 border border-white/10 transition px-8 py-3.5 rounded-2xl text-white font-semibold text-[15px] backdrop-blur-sm"
                                    >
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/feed"
                                    className="btn-glow bg-orange-500 px-8 py-3.5 rounded-2xl text-black font-semibold text-[15px] inline-block"
                                >
                                    Continue to Feed →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;