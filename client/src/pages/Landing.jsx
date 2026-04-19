import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Landing() {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: "⚡",
            title: "Instant Campus Buzz",
            description: "Drop updates in seconds and keep your batch in sync with everything happening now.",
        },
        {
            icon: "🎯",
            title: "Clubs + Events, Sorted",
            description: "From hackathons to open mics, discover student events before they sell out.",
        },
        {
            icon: "💬",
            title: "Real Student Conversations",
            description: "Share opinions, memes, wins, and random campus moments in one social space.",
        },
    ];

    return (
        <div className="min-h-screen text-white">
            <Navbar />

            <section className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-[-100px] w-80 h-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
                    <div className="absolute top-20 right-[-70px] w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />
                    <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-violet-500/25 blur-3xl" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-fuchsia-500/15 px-4 py-2 text-sm text-fuchsia-200 mb-6">
                                ✨ Gen-Z vibes. Student-first energy.
                            </span>

                            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6">
                                Your Campus,
                                <span className="block bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 text-transparent bg-clip-text">
                                    Your Digital Scene
                                </span>
                            </h1>

                            <p className="text-zinc-200/90 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
                                CampusConnect is where students flex ideas, discover events, and build their crew.
                                Think social feed + campus culture + creator energy — all in one platform.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/register"
                                            className="bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-95 transition px-6 py-4 rounded-2xl text-white font-semibold text-center shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                                        >
                                            Join CampusConnect
                                        </Link>

                                        <Link
                                            to="/login"
                                            className="bg-white/10 hover:bg-white/15 border border-white/15 transition px-6 py-4 rounded-2xl text-white font-semibold text-center"
                                        >
                                            Already a member?
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/feed"
                                            className="bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-95 transition px-6 py-4 rounded-2xl text-white font-semibold text-center"
                                        >
                                            Open Feed
                                        </Link>

                                        <Link
                                            to="/profile"
                                            className="bg-white/10 hover:bg-white/15 border border-white/15 transition px-6 py-4 rounded-2xl text-white font-semibold text-center"
                                        >
                                            Edit My Profile
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    ["24/7", "Campus updates"],
                                    ["100%", "Student focused"],
                                    ["∞", "Creative posts"],
                                    ["1", "Unified space"],
                                ].map(([value, label]) => (
                                    <div key={label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                        <p className="text-2xl font-bold text-fuchsia-300">{value}</p>
                                        <p className="text-zinc-300 text-sm mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative bg-black/45 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-white">Aarav · CSE 2nd Year</h3>
                                            <p className="text-zinc-300 text-sm">@aarav.codes</p>
                                        </div>
                                        <span className="text-xs text-zinc-400">now</span>
                                    </div>
                                    <p className="text-zinc-100 mb-4">
                                        Built a mini AI attendance tracker for our lab 😮‍💨 anyone wants the repo?
                                    </p>
                                    <div className="flex gap-4 text-sm text-zinc-300">
                                        <span>🔥 54</span>
                                        <span>💬 21</span>
                                        <span>🔁 8</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-white">Design Club</h3>
                                            <p className="text-zinc-300 text-sm">@designverse</p>
                                        </div>
                                        <span className="text-xs text-zinc-400">12 min ago</span>
                                    </div>
                                    <p className="text-zinc-100 mb-4">
                                        Posters + reels workshop at 5 PM. Bring your laptop + chaotic creativity.
                                    </p>
                                    <div className="flex gap-4 text-sm text-zinc-300">
                                        <span>🎨 39</span>
                                        <span>✅ 63 joined</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                    <div className="text-center mb-12">
                        <p className="text-fuchsia-300 font-medium mb-3">Why students love it</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Campus social, upgraded</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-fuchsia-300/40 transition"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/10 text-2xl flex items-center justify-center mb-5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-zinc-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;
