import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Avatar({ name, avatar, size = 36 }) {
    if (avatar) {
        return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
    }
    const initials = name?.substring(0, 2).toUpperCase() || "?";
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, fontWeight: 'bold', flexShrink: 0
        }}>
            {initials}
        </div>
    );
}

const AdminDashboard = () => {
    const { authUser } = useAuth();
    const [usersList, setUsersList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
            const res = await axios.get(`/admin/users${query}`);
            setUsersList(res.data.users);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setMessage("Error fetching users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authUser?.role === 'admin') {
            const delayDebounceFn = setTimeout(() => {
                fetchUsers();
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        }
    }, [authUser, searchTerm]);

    const togglePermission = async (targetUser) => {
        try {
            if (targetUser.canPost) {
                await axios.put(`/admin/revoke/${targetUser._id}`);
                setMessage(`Revoked posting rights for @${targetUser.username}`);
            } else {
                await axios.put(`/admin/grant/${targetUser._id}`);
                setMessage(`Granted posting rights to @${targetUser.username}`);
            }
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Permission update failed:", error);
            setMessage("Error updating permissions.");
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (authUser?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#0A0A0F]">
                <Navbar />
                <div className="flex items-center justify-center p-5 pt-20">
                    <div className="glass-compose p-10 text-center max-w-md w-full rounded-3xl" style={{ border: '1px solid rgba(255,107,107,0.2)' }}>
                        <div className="text-5xl mb-4">🚫</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                        <p className="text-white/50 text-sm mb-6">Only the Master Developer can view this page.</p>
                        <Link to="/feed" className="cta-btn inline-block">Return to Feed</Link>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <Navbar />
            <div className="p-5 sm:p-10 fade-in pb-24 pt-20">
                <div className="max-w-4xl mx-auto">
                
                <div className="glass-compose p-8 rounded-3xl mb-8 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex items-center gap-4 mb-3 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
                            👑
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Master Control Panel</h1>
                            <p className="text-white/50 text-sm mt-1">Manage network access and posting privileges</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 fade-in" style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
                        <span className="text-teal-400">⚡</span>
                        <p className="text-teal-50 font-medium text-sm">{message}</p>
                    </div>
                )}

                <div className="glass-compose rounded-3xl p-2 sm:p-6">
                    <div className="px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05]">
                        <h2 className="text-white/80 font-bold text-sm uppercase tracking-wider">Network Users ({usersList.length})</h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors w-full sm:w-48"
                                />
                            </div>
                            <button onClick={fetchUsers} className="text-white/40 hover:text-white transition text-sm flex items-center gap-1 shrink-0 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {loading ? (
                            <div className="p-10 text-center text-white/30 text-sm animate-pulse">Loading network database...</div>
                        ) : usersList.length === 0 ? (
                            <div className="p-10 text-center text-white/40 text-sm">No users found matching your criteria.</div>
                        ) : (
                            usersList.map((u, i) => (
                                <div key={u._id} className="group p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/[0.02]" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex items-center gap-4">
                                        <Avatar name={u.name} avatar={u.avatar} size={42} />
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-white font-bold text-[15px]">{u.name}</h3>
                                                <span className="text-white/30 text-xs">@{u.username}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.canPost ? 'bg-teal-400 shadow-[0_0_8px_rgba(0,212,170,0.6)]' : 'bg-red-400'}`}></span>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${u.canPost ? 'text-teal-400/80' : 'text-red-400/80'}`}>
                                                    {u.canPost ? 'Posting Authorized' : 'Locked (Read-Only)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => togglePermission(u)}
                                        className="sm:w-auto w-full px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                                        style={{
                                            background: u.canPost ? 'rgba(255,107,107,0.1)' : 'rgba(0,212,170,0.1)',
                                            color: u.canPost ? '#FF6B6B' : '#00D4AA',
                                            border: `1px solid ${u.canPost ? 'rgba(255,107,107,0.2)' : 'rgba(0,212,170,0.2)'}`
                                        }}
                                    >
                                        {u.canPost ? (
                                            <><span>🔒</span> Revoke Access</>
                                        ) : (
                                            <><span>✨</span> Grant Access</>
                                        )}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default AdminDashboard;