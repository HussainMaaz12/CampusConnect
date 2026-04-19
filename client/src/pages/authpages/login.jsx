import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .login-root {
    font-family: 'DM Sans', sans-serif;
  }
  .login-root h1, .login-root .display {
    font-family: 'Syne', sans-serif;
  }

  /* Animated gradient mesh background */
  .mesh-bg {
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(249,115,22,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 90%, rgba(168,85,247,0.14) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 60% 30%, rgba(251,191,36,0.07) 0%, transparent 50%),
      #070707;
    animation: mesh-shift 12s ease-in-out infinite alternate;
  }
  @keyframes mesh-shift {
    0%   { background-position: 0% 0%, 100% 100%, 60% 30%; }
    100% { background-position: 5% 10%, 95% 90%, 65% 25%; }
  }

  /* Floating grid */
  .grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Card glass */
  .glass-card {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.09);
    box-shadow:
      0 0 0 1px rgba(249,115,22,0.08),
      0 32px 80px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.06);
  }

  /* Gradient brand text */
  .brand-gradient {
    background: linear-gradient(110deg, #f97316 20%, #a855f7 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Input styling */
  .cc-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px;
    padding: 13px 16px;
    color: white;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .cc-input::placeholder { color: rgba(255,255,255,0.25); }
  .cc-input:focus {
    border-color: rgba(249,115,22,0.55);
    background: rgba(249,115,22,0.05);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
  }

  /* Submit button */
  .submit-btn {
    width: 100%;
    position: relative;
    overflow: hidden;
    background: linear-gradient(115deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
    border: none;
    border-radius: 14px;
    padding: 14px;
    color: #000;
    font-weight: 700;
    font-size: 15px;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s;
    box-shadow: 0 6px 30px rgba(249,115,22,0.35);
    letter-spacing: 0.02em;
  }
  .submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .submit-btn:hover:not(:disabled)::before { opacity: 1; }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(249,115,22,0.50);
  }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Loading spinner */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Fade-in card */
  .card-enter {
    animation: cardIn 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
  @keyframes cardIn {
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Stagger children */
  .s1 { animation: fadeUp 0.5s ease 0.15s forwards; opacity: 0; transform: translateY(14px); }
  .s2 { animation: fadeUp 0.5s ease 0.25s forwards; opacity: 0; transform: translateY(14px); }
  .s3 { animation: fadeUp 0.5s ease 0.35s forwards; opacity: 0; transform: translateY(14px); }
  .s4 { animation: fadeUp 0.5s ease 0.45s forwards; opacity: 0; transform: translateY(14px); }
  .s5 { animation: fadeUp 0.5s ease 0.55s forwards; opacity: 0; transform: translateY(14px); }
  .s6 { animation: fadeUp 0.5s ease 0.62s forwards; opacity: 0; transform: translateY(14px); }
  @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

  /* Orb decorations */
  .orb-orange {
    background: radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%);
    animation: orb-pulse 7s ease-in-out infinite;
  }
  .orb-purple {
    background: radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 70%);
    animation: orb-pulse 9s ease-in-out infinite reverse;
  }
  @keyframes orb-pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.12); opacity: 1; }
  }

  /* Divider */
  .or-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255,255,255,0.2);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .or-divider::before, .or-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.08);
  }

  /* Social btn */
  .social-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    padding: 12px 16px;
    color: rgba(255,255,255,0.65);
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    text-decoration: none;
  }
  .social-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.18);
    color: #fff;
    transform: translateY(-1px);
  }
  .social-btn:active {
    transform: translateY(0);
  }
  .social-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  /* Password show/hide */
  .pw-toggle {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.3);
    padding: 0;
    transition: color 0.2s;
    font-size: 18px;
    line-height: 1;
  }
  .pw-toggle:hover { color: rgba(255,255,255,0.7); }

  /* Label */
  .field-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.55);
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  /* Error shake */
  .error-box {
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-5px); }
    40%,80% { transform: translateX(5px); }
  }

  /* Purple accent tag */
  .purple-tag {
    background: linear-gradient(110deg, rgba(168,85,247,0.15), rgba(249,115,22,0.10));
    border: 1px solid rgba(168,85,247,0.2);
    color: rgba(200,160,255,0.9);
  }

  /* Noise */
  .noise {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  }
`;

function EyeIcon({ open }) {
    return open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleChange = (e) =>
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const { email, password } = formData;
        if (!email || !password) {
            setError("Please enter both email and password.");
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
            setError(err.response?.data?.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        flow: "implicit",
        onSuccess: async (tokenResponse) => {
            try {
                setGoogleLoading(true);
                setError("");

                // Get user info from Google using the access token
                const googleUserInfo = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );
                const googleUser = await googleUserInfo.json();

                // Send to our backend
                const response = await api.post("/auth/google", {
                    credential: tokenResponse.access_token,
                    googleUser,
                });

                if (response.data.success) {
                    const { user, token } = response.data;
                    login(user, token);
                    navigate("/feed");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Google sign-in failed. Try again.");
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            setError("Google sign-in was cancelled or failed.");
        },
    });

    return (
        <div className="login-root min-h-screen mesh-bg grid-bg noise flex items-center justify-center px-5 py-12 relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            {/* Ambient orbs */}
            <div className="orb-orange absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none" />
            <div className="orb-purple absolute -bottom-32 -right-32 w-[440px] h-[440px] rounded-full pointer-events-none" />

            {/* Back link */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-white/30 hover:text-white/70 transition z-10"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back
            </Link>

            <div className="w-full max-w-[420px] card-enter">
                {/* Logo / brand */}
                <div className="s1 text-center mb-8">
                    <div className="inline-flex items-center gap-2 purple-tag rounded-full px-4 py-1.5 text-xs font-semibold mb-5 tracking-wide">
                        ✦ CampusConnect
                    </div>
                    <h1 className="text-[2.2rem] font-extrabold leading-tight mb-2">
                        Welcome <span className="brand-gradient">back 👋</span>
                    </h1>
                    <p className="text-white/35 text-[14px]">
                        Sign in to your campus account to continue.
                    </p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-3xl p-7">

                    {/* Error */}
                    {error && (
                        <div className="error-box mb-5 rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3 flex items-start gap-2.5">
                            <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                            <p className="text-red-300 text-sm leading-snug">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="s2 mb-4">
                            <label className="field-label">Email address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@college.edu"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="cc-input pr-11"
                                    autoComplete="email"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none text-base">
                                    ✉
                                </span>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="s3 mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                                <button
                                    type="button"
                                    className="text-[12px] text-orange-400/80 hover:text-orange-400 transition font-medium"
                                    tabIndex={-1}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="cc-input pr-11"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="pw-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
                                    onClick={() => setShowPw((p) => !p)}
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showPw} />
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="s4">
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner" />
                                        Signing in…
                                    </>
                                ) : (
                                    "Sign In →"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="s5 or-divider my-5">or</div>

                    {/* Google login */}
                    <div className="s5">
                        <button
                            className="social-btn"
                            onClick={() => handleGoogleLogin()}
                            disabled={googleLoading}
                        >
                            {googleLoading ? (
                                <>
                                    <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                                    Signing in with Google…
                                </>
                            ) : (
                                <>
                                    <GoogleIcon />
                                    Continue with Google
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="s6 text-white/30 text-[13px] text-center mt-6">
                    New to CampusConnect?{" "}
                    <Link
                        to="/register"
                        className="text-orange-400 hover:text-orange-300 font-semibold transition"
                    >
                        Create an account →
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;