import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const { email, password } = formData;

        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/login", formData);

            if (response.data.success) {
                const { user, token } = response.data;
                login(user, token);
                navigate("/feed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white flex items-center justify-center px-6 py-10 relative overflow-hidden">
            <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative w-full max-w-md bg-black/35 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
                <span className="inline-flex mb-3 text-xs font-semibold uppercase tracking-widest text-fuchsia-200 bg-fuchsia-500/10 border border-fuchsia-300/20 rounded-full px-3 py-1">
                    Welcome back
                </span>
                <h1 className="text-3xl font-bold mb-2">Log in to your campus vibe</h1>
                <p className="text-zinc-300 mb-6">Continue your conversations, clubs, and collabs.</p>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-200 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-fuchsia-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-200 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-fuchsia-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-zinc-300 text-sm mt-6 text-center">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-fuchsia-300 hover:text-fuchsia-200">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
