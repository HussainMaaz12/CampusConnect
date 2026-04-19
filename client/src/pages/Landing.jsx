import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Landing() {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            title: "Campus Feed",
            description:
                "Share updates, moments, ideas, and events happening around your college in real time.",
        },
        {
            title: "Likes & Comments",
            description:
                "Engage with posts through reactions and discussions that make the platform interactive.",
        },
        {
            title: "Student Profiles",
            description:
                "Maintain a personal profile, view your activity, and build your campus identity online.",
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        {/* Left Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300 mb-6">
                                🚀 Built for Modern Campus Communities
                            </div>

                            <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
                                The Social Platform
                                <span className="block text-orange-500">Made for Students</span>
                            </h1>

                            <p className="text-zinc-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
                                CampusConnect is a modern student-first social media platform where
                                college communities can share updates, interact through likes and
                                comments, and build a stronger digital campus presence.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                {!isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/register"
                                            className="bg-orange-500 hover:bg-orange-600 transition px-6 py-4 rounded-2xl text-black font-semibold text-center"
                                        >
                                            Start Connecting
                                        </Link>

                                        <Link
                                            to="/login"
                                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition px-6 py-4 rounded-2xl text-white font-semibold text-center"
                                        >
                                            Login to Continue
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/feed"
                                            className="bg-orange-500 hover:bg-orange-600 transition px-6 py-4 rounded-2xl text-black font-semibold text-center"
                                        >
                                            Go to Feed
                                        </Link>

                                        <Link
                                            to="/profile"
                                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition px-6 py-4 rounded-2xl text-white font-semibold text-center"
                                        >
                                            View Profile
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mini Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                    <p className="text-2xl font-bold text-orange-500">01</p>
                                    <p className="text-zinc-400 text-sm mt-1">Unified Feed</p>
                                </div>

                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                    <p className="text-2xl font-bold text-orange-500">02</p>
                                    <p className="text-zinc-400 text-sm mt-1">Profiles</p>
                                </div>

                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                    <p className="text-2xl font-bold text-orange-500">03</p>
                                    <p className="text-zinc-400 text-sm mt-1">Likes</p>
                                </div>

                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                    <p className="text-2xl font-bold text-orange-500">04</p>
                                    <p className="text-zinc-400 text-sm mt-1">Comments</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Showcase */}
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />

                            <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                                {/* Mock Post 1 */}
                                <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-5 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-white">Maaz Dev</h3>
                                            <p className="text-zinc-400 text-sm">@maazdev</p>
                                        </div>
                                        <span className="text-xs text-zinc-500">2 mins ago</span>
                                    </div>
                                    <p className="text-zinc-200 mb-4">
                                        Just launched CampusConnect 🚀 The campus finally has its own social platform.
                                    </p>
                                    <div className="flex gap-4 text-sm text-zinc-400">
                                        <span>❤️ 12 Likes</span>
                                        <span>💬 4 Comments</span>
                                    </div>
                                </div>

                                {/* Mock Post 2 */}
                                <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-white">Tech Club</h3>
                                            <p className="text-zinc-400 text-sm">@techclub</p>
                                        </div>
                                        <span className="text-xs text-zinc-500">10 mins ago</span>
                                    </div>
                                    <p className="text-zinc-200 mb-4">
                                        Hackathon registrations open now. Let’s build something impactful.
                                    </p>
                                    <div className="flex gap-4 text-sm text-zinc-400">
                                        <span>❤️ 27 Likes</span>
                                        <span>💬 9 Comments</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="border-t border-zinc-900">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                    <div className="text-center mb-12">
                        <p className="text-orange-400 font-medium mb-3">Why CampusConnect?</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Designed for student communities
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Everything needed for a campus-first social platform — simple, fast,
                            engaging, and built for real interaction.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-orange-500/30 transition"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl mb-5">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="border-t border-zinc-900">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-10 text-center">
                        <p className="text-orange-400 font-medium mb-3">Ready to experience it?</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Start building your campus presence
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
                            Join CampusConnect and explore a modern social platform made for students,
                            clubs, events, and real campus interaction.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/register"
                                        className="bg-orange-500 hover:bg-orange-600 transition px-6 py-4 rounded-2xl text-black font-semibold"
                                    >
                                        Create Account
                                    </Link>

                                    <Link
                                        to="/login"
                                        className="bg-zinc-800 hover:bg-zinc-700 transition px-6 py-4 rounded-2xl text-white font-semibold"
                                    >
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    to="/feed"
                                    className="bg-orange-500 hover:bg-orange-600 transition px-6 py-4 rounded-2xl text-black font-semibold"
                                >
                                    Continue to Feed
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