import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        username: "",
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

        const { name, username, email, password } = formData;

        if (!name || !username || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/auth/register", formData);

            if (response.data.success) {
                const { user, token } = response.data;
                login(user, token);
                navigate("/feed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong during registration");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white flex items-center justify-center px-6 py-10 relative overflow-hidden">
            <div className="absolute -top-20 right-[-30px] w-72 h-72 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative w-full max-w-md bg-black/35 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
                <span className="inline-flex mb-3 text-xs font-semibold uppercase tracking-widest text-violet-200 bg-violet-500/10 border border-violet-300/20 rounded-full px-3 py-1">
                    New here?
                </span>
                <h1 className="text-3xl font-bold mb-2">Create your student profile</h1>
                <p className="text-zinc-300 mb-6">Join the coolest campus-only social platform.</p>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-200 mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-violet-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-200 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-violet-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-200 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-violet-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-200 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-violet-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="text-zinc-300 text-sm mt-6 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-violet-300 hover:text-violet-200">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
