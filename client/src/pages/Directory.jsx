import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/SocketContext";

const dirCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  .dir-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; position: relative; }
  .dir-root h1,.dir-root h2,.dir-root h3 { font-family: 'Syne', sans-serif; }
  .dir-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: #0A0A0F; }
  .dir-bg::before { content:''; position:absolute; inset:0; background:
    radial-gradient(ellipse 60% 35% at 20% 10%, rgba(108,99,255,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 50% 30% at 80% 85%, rgba(0,212,170,0.05) 0%, transparent 55%); }
  .dir-content { position: relative; z-index: 1; }
  .dir-fade { animation: _dirFade 0.5s ease forwards; opacity: 0; transform: translateY(12px); }
  @keyframes _dirFade { to { opacity: 1; transform: translateY(0); } }

  .dir-card {
    background: rgba(14,14,22,0.7);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 24px;
    padding: 0;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .dir-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(108,99,255,0.04) 0%, transparent 40%);
    opacity: 0;
    transition: opacity 0.35s;
    pointer-events: none;
  }
  .dir-card:hover {
    border-color: rgba(108,99,255,0.15);
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(108,99,255,0.06);
  }
  .dir-card:hover::before { opacity: 1; }
  .dir-card:hover .dir-avatar { transform: scale(1.08); }
  .dir-card:hover .dir-name { color: #fff; }
  .dir-card:hover .dir-view-btn { opacity: 1; transform: translateY(0); }

  .dir-avatar { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }

  .dir-banner {
    height: 80px;
    position: relative;
    border-radius: 24px 24px 0 0;
    overflow: hidden;
  }

  .dir-view-btn {
    opacity: 0;
    transform: translateY(4px);
    transition: all 0.3s;
  }

  .dir-filter-glass {
    background: rgba(14,14,22,0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 28px;
  }

  .dir-input {
    width: 100%;
    background: rgba(10,10,15,0.8);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 13px;
    color: #fff;
    transition: all 0.25s;
    outline: none;
  }
  .dir-input:focus {
    border-color: rgba(108,99,255,0.5);
    box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
  }
  .dir-input::placeholder { color: rgba(255,255,255,0.2); }

  .dir-select {
    width: 100%;
    background: rgba(10,10,15,0.8);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    appearance: none;
    transition: all 0.25s;
    outline: none;
    cursor: pointer;
  }
  .dir-select:focus {
    border-color: rgba(108,99,255,0.5);
    box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
  }

  .dir-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
    background-size: 200% 100%;
    animation: _shimmer 1.5s infinite;
    border-radius: 24px;
  }
  @keyframes _shimmer { to { background-position: -200% 0; } }

  .dir-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    transition: all 0.25s;
  }

  .online-pulse {
    animation: _onPulse 2s ease infinite;
  }
  @keyframes _onPulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(0,212,170,0.5); } 50%{ box-shadow: 0 0 0 4px rgba(0,212,170,0); } }
`;

const BANNER_GRADIENTS = [
    'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,170,0.1))',
    'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(108,99,255,0.1))',
    'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(255,107,107,0.1))',
    'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(249,115,22,0.1))',
    'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(108,99,255,0.1))',
    'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(0,212,170,0.08))',
];

function hashIndex(str, len) {
    let h = 0;
    for (let i = 0; i < (str?.length || 0); i++) h = (h * 31 + str.charCodeAt(i)) % 1e9;
    return Math.abs(h) % len;
}

export default function Directory() {
    const { isOnline } = useSocket();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        search: "",
        department: "",
        year: "",
        interest: ""
    });
    const [viewMode, setViewMode] = useState('grid');
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 400);
        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        const fetchDirectory = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (debouncedFilters.search) query.append("search", debouncedFilters.search);
                if (debouncedFilters.department) query.append("department", debouncedFilters.department);
                if (debouncedFilters.year) query.append("year", debouncedFilters.year);
                if (debouncedFilters.interest) query.append("interest", debouncedFilters.interest);
                query.append("limit", "40");

                const res = await api.get(`/auth/directory?${query.toString()}`);
                if (res.data.success) {
                    setUsers(res.data.users);
                    setTotalCount(res.data.total || res.data.count || res.data.users.length);
                }
            } catch (err) {
                console.error("Failed to fetch directory:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDirectory();
    }, [debouncedFilters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setFilters({ search: "", department: "", year: "", interest: "" });
    };

    const hasActiveFilters = filters.search || filters.department || filters.year || filters.interest;

    const onlineCount = useMemo(() => users.filter(u => isOnline(u._id)).length, [users, isOnline]);

    return (
        <div className="dir-root">
            <style dangerouslySetInnerHTML={{ __html: dirCSS }} />
            <div className="dir-bg" />
            <div className="dir-content">
                <Navbar />

                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

                    <div className="mb-10 dir-fade">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                                    Student <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#00D4AA]">Directory</span>
                                </h1>
                                <p className="text-white/40 text-[15px]">Discover, connect, and collaborate with peers across campus</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                                    <span className="w-2 h-2 rounded-full bg-[#00D4AA] online-pulse"></span>
                                    <span className="text-white/40 text-[12px] font-semibold">{onlineCount} online</span>
                                </div>
                                <div className="text-white/20 text-[12px] font-semibold px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                                    {totalCount} students
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dir-filter-glass p-6 sm:p-8 mb-10 dir-fade" style={{ animationDelay: '0.05s' }}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                </div>
                                <span className="text-white/50 text-[12px] font-bold uppercase tracking-widest">Filters</span>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-[11px] font-bold text-[#FF6B6B]/70 hover:text-[#FF6B6B] transition px-3 py-1 rounded-lg bg-[#FF6B6B]/5 border border-[#FF6B6B]/10 hover:bg-[#FF6B6B]/10"
                                >
                                    Clear all ✕
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-white/25 text-[10px] font-bold mb-2 uppercase tracking-wider">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="search"
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                        placeholder="Name, username, bio..."
                                        className="dir-input pl-10"
                                    />
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/25 text-[10px] font-bold mb-2 uppercase tracking-wider">Department</label>
                                <select name="department" value={filters.department} onChange={handleFilterChange} className="dir-select">
                                    <option value="">All Departments</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Business">Business</option>
                                    <option value="Arts">Arts</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/25 text-[10px] font-bold mb-2 uppercase tracking-wider">Graduation Year</label>
                                <select name="year" value={filters.year} onChange={handleFilterChange} className="dir-select">
                                    <option value="">All Years</option>
                                    <option value="2024">Class of 2024</option>
                                    <option value="2025">Class of 2025</option>
                                    <option value="2026">Class of 2026</option>
                                    <option value="2027">Class of 2027</option>
                                    <option value="2028">Class of 2028</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/25 text-[10px] font-bold mb-2 uppercase tracking-wider">Interest</label>
                                <input
                                    type="text"
                                    name="interest"
                                    value={filters.interest}
                                    onChange={handleFilterChange}
                                    placeholder="AI, Web3, Design..."
                                    className="dir-input"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} className="dir-skeleton h-[280px]" style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="dir-fade text-center py-24 px-6 rounded-3xl" style={{ background: 'rgba(14,14,22,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                                <span className="text-4xl">🔍</span>
                            </div>
                            <h3 className="text-xl font-extrabold text-white/70 mb-3">No students found</h3>
                            <p className="text-white/30 text-[14px] max-w-sm mx-auto mb-6 leading-relaxed">We couldn't find anyone matching your criteria. Try broadening your filters.</p>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 hover:bg-[#6C63FF]/20 transition">
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {users.map((user, idx) => {
                                const bannerGrad = BANNER_GRADIENTS[hashIndex(user._id, BANNER_GRADIENTS.length)];
                                const online = isOnline(user._id);
                                const followerCount = user.followers?.length || 0;
                                const followingCount = user.following?.length || 0;

                                return (
                                    <Link
                                        to={`/user/${user.username}`}
                                        key={user._id}
                                        className="dir-card dir-fade"
                                        style={{ animationDelay: `${0.03 * idx}s` }}
                                    >
                                        <div className="dir-banner" style={{ background: bannerGrad }}>
                                            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(14,14,22,0.95) 100%)' }}></div>
                                            {online && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold" style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.25)' }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] online-pulse"></span>
                                                    Online
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-5 -mt-8 relative z-10 pb-5 flex-1 flex flex-col">
                                            <div className="flex items-end justify-between mb-3">
                                                <div className="relative">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} className="dir-avatar w-[60px] h-[60px] rounded-2xl object-cover shadow-xl ring-[3px] ring-[#0E0E16]" alt={user.name} />
                                                    ) : (
                                                        <div className="dir-avatar w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center font-extrabold text-xl text-white shadow-xl ring-[3px] ring-[#0E0E16]" style={{ fontFamily: "'Syne'" }}>
                                                            {user.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-3 mb-1">
                                                    <div className="text-center">
                                                        <p className="text-white/80 text-[14px] font-extrabold leading-none" style={{ fontFamily: "'Syne'" }}>{followerCount}</p>
                                                        <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest mt-0.5">followers</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-white/80 text-[14px] font-extrabold leading-none" style={{ fontFamily: "'Syne'" }}>{followingCount}</p>
                                                        <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest mt-0.5">following</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="dir-name font-bold text-[15px] text-white/85 truncate transition-colors">{user.name}</h3>
                                            <p className="text-[11px] text-[#6C63FF]/60 font-medium mb-3 truncate">@{user.username}</p>

                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {user.department && (
                                                    <span className="dir-tag" style={{ background: 'rgba(108,99,255,0.08)', color: 'rgba(108,99,255,0.85)', border: '1px solid rgba(108,99,255,0.15)' }}>
                                                        🎓 {user.department}
                                                    </span>
                                                )}
                                                {user.year && (
                                                    <span className="dir-tag" style={{ background: 'rgba(0,212,170,0.08)', color: 'rgba(0,212,170,0.85)', border: '1px solid rgba(0,212,170,0.15)' }}>
                                                        📅 '{user.year.toString().slice(2)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-auto">
                                                {user.interests && user.interests.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5 overflow-hidden" style={{ maxHeight: 42 }}>
                                                        {user.interests.slice(0, 4).map((interest, i) => (
                                                            <span key={i} className="text-[9px] font-semibold px-2 py-1 rounded-md text-white/40" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                #{interest}
                                                            </span>
                                                        ))}
                                                        {user.interests.length > 4 && (
                                                            <span className="text-[9px] font-bold px-2 py-1 text-white/20">+{user.interests.length - 4}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-white/20 text-[11px] line-clamp-2 leading-relaxed" style={{ minHeight: 34 }}>
                                                        {user.bio || "No bio available."}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="dir-view-btn mt-4 pt-3 border-t border-white/[0.04]">
                                                <div className="w-full py-2 rounded-xl text-center text-[11px] font-bold text-[#6C63FF]/80 bg-[#6C63FF]/[0.06] border border-[#6C63FF]/10 hover:bg-[#6C63FF]/10 transition">
                                                    View Profile →
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {!loading && users.length > 0 && (
                        <div className="mt-10 text-center dir-fade" style={{ animationDelay: '0.3s' }}>
                            <p className="text-white/15 text-[11px] font-semibold">
                                Showing {users.length} of {totalCount} students
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
