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

                // Save login state in AuthContext + localStorage
                login(user, token);

                // Redirect to feed
                navigate("/feed");
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Something went wrong during login"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-orange-500 mb-2">Welcome Back</h1>
                <p className="text-zinc-400 mb-6">
                    Login to continue to CampusConnect.
                </p>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-zinc-400 text-sm mt-6 text-center">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-orange-400 hover:text-orange-300">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;