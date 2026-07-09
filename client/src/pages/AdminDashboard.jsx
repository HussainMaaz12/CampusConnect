import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Tooltip, Legend, Filler
);

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

const ACTION_COLORS = {
    'GRANT_POST_PERMISSION': { bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.3)', text: '#00D4AA', label: 'GRANT' },
    'REVOKE_POST_PERMISSION': { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#FF6B6B', label: 'REVOKE' },
    'BULK_GRANT_POST_PERMISSION': { bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.3)', text: '#00D4AA', label: 'BULK GRANT' },
    'BULK_REVOKE_POST_PERMISSION': { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#FF6B6B', label: 'BULK REVOKE' },
    'UPDATE_REPORT': { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', text: '#F97316', label: 'REPORT' },
    'EXPORT_USERS_CSV': { bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.3)', text: '#6C63FF', label: 'EXPORT' },
};

const AdminDashboard = () => {
    const { authUser } = useAuth();
    const [usersList, setUsersList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const [setup2FaStep, setSetup2FaStep] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [setupError, setSetupError] = useState('');
    const [activeTab, setActiveTab] = useState('analytics');
    const [reportsList, setReportsList] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
            const res = await axios.get(`/admin/users${query}`);
            setUsersList(res.data.users);
        } catch (error) {
            setMessage("Error fetching users.");
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setReportsLoading(true);
        try {
            const res = await axios.get('/admin/reports');
            setReportsList(res.data.reports);
        } catch (error) {
            setMessage("Error fetching reports.");
        } finally {
            setReportsLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await axios.get('/admin/analytics');
            if (res.data.success) setAnalytics(res.data.analytics);
        } catch (error) {
            setMessage("Error fetching analytics.");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        setAuditLoading(true);
        try {
            const res = await axios.get('/admin/audit-logs');
            if (res.data.success) setAuditLogs(res.data.logs);
        } catch (error) {
            setMessage("Error fetching audit logs.");
        } finally {
            setAuditLoading(false);
        }
    };

    useEffect(() => {
        if ((authUser?.role === 'admin' || authUser?.role === 'super-admin') && authUser?.isTwoFactorEnabled) {
            if (activeTab === 'users') {
                const delayDebounceFn = setTimeout(() => { fetchUsers(); }, 300);
                return () => clearTimeout(delayDebounceFn);
            } else if (activeTab === 'reports') {
                fetchReports();
            } else if (activeTab === 'analytics') {
                fetchAnalytics();
            } else if (activeTab === 'audit') {
                fetchAuditLogs();
            }
        }
    }, [authUser, searchTerm, activeTab]);

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
            setMessage("Error updating permissions.");
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const updateReportStatus = async (reportId, status, actionTaken = '') => {
        try {
            await axios.put(`/admin/reports/${reportId}/status`, { status, actionTaken });
            setMessage(`Report marked as ${status}`);
            fetchReports();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Error updating report status.");
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleStart2FA = async () => {
        try {
            setSetupError('');
            const res = await axios.post('/auth/setup-2fa');
            if (res.data.success) {
                setQrCode(res.data.qrCode);
                setSecret(res.data.secret);
                setSetup2FaStep('verify');
            }
        } catch (error) {
            setSetupError("Failed to initiate 2FA setup.");
        }
    };

    const handleVerify2FA = async () => {
        if (!code) {
            setSetupError("Please enter the code.");
            return;
        }
        try {
            setSetupError('');
            const res = await axios.post('/auth/verify-2fa', { code });
            if (res.data.success) {
                window.location.reload();
            }
        } catch (error) {
            setSetupError(error.response?.data?.message || "Invalid 2FA code.");
        }
    };

    const toggleSelectUser = (id) => {
        setSelectedUsers(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === usersList.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(usersList.map(u => u._id)));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedUsers.size === 0) return;
        setBulkActionLoading(true);
        try {
            const res = await axios.put('/admin/bulk-permissions', {
                userIds: Array.from(selectedUsers),
                action
            });
            if (res.data.success) {
                setMessage(res.data.message);
                setSelectedUsers(new Set());
                fetchUsers();
                setTimeout(() => setMessage(''), 4000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Bulk action failed.");
            setTimeout(() => setMessage(''), 4000);
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
            const res = await axios.get(`/admin/export-csv${query}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `campusconnect_users_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setMessage("CSV export downloaded successfully.");
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Failed to export CSV.");
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60) return `${s}s ago`;
        const m = Math.floor(s / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        if (d < 30) return `${d}d ago`;
        return new Date(date).toLocaleDateString();
    };

    if (authUser?.role !== 'admin' && authUser?.role !== 'super-admin') {
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

    if (!authUser?.isTwoFactorEnabled) {
        return (
            <div className="min-h-screen bg-[#0A0A0F]">
                <Navbar />
                <div className="flex items-center justify-center p-5 pt-24">
                    <div className="bg-[#111116]/80 backdrop-blur-2xl p-10 text-center max-w-[440px] w-full rounded-[2rem] shadow-[0_10px_50px_rgba(108,99,255,0.15)] relative overflow-hidden" style={{ border: '1px solid rgba(108,99,255,0.2)' }}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6C63FF] to-[#00D4AA]"></div>
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/20 flex items-center justify-center mb-6 shadow-inner border border-white/5">
                            <span className="text-4xl filter drop-shadow-lg">🛡️</span>
                        </div>
                        <h2 className="text-[26px] leading-tight font-extrabold text-white mb-3 font-syne tracking-tight">Two-Step Verification</h2>
                        <p className="text-white/50 text-[14px] mb-8 leading-relaxed px-4">Master Developer access is restricted. You must secure your account with an authenticator app before proceeding.</p>

                        {setupError && (
                            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                {setupError}
                            </div>
                        )}

                        {setup2FaStep === '' && (
                            <button onClick={handleStart2FA} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white font-bold text-[15px] shadow-[0_4px_20px_rgba(108,99,255,0.4)] hover:shadow-[0_6px_25px_rgba(108,99,255,0.5)] transition-all hover:-translate-y-0.5 active:scale-95 font-syne">Get Started →</button>
                        )}

                        {setup2FaStep === 'verify' && (
                            <div className="text-left mt-2">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-center shadow-inner">
                                    <p className="text-white/60 text-[12px] mb-4 font-semibold uppercase tracking-wider">1. Scan QR Code</p>
                                    <div className="bg-white p-3 rounded-2xl w-fit mx-auto mb-4 shadow-lg hover:scale-105 transition-transform duration-500">
                                        <img src={qrCode} alt="2FA QR Code" className="w-[180px] h-[180px]" />
                                    </div>
                                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-1.5">Or enter key manually</p>
                                    <p className="text-white font-mono text-[14px] tracking-widest bg-black/40 px-3 py-2 rounded-xl border border-white/5 select-all">{secret}</p>
                                </div>

                                <div className="relative mb-6">
                                    <p className="text-white/60 text-[12px] mb-3 font-semibold uppercase tracking-wider text-center">2. Enter 6-Digit Code</p>
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        className="w-full bg-[#050508] border border-[#6C63FF]/30 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/30 transition-all shadow-inner placeholder-white/10"
                                        maxLength="6"
                                        value={code}
                                        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                <button
                                    onClick={handleVerify2FA}
                                    disabled={code.length !== 6}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] text-white font-bold text-[15px] shadow-[0_4px_20px_rgba(108,99,255,0.4)] hover:shadow-[0_6px_25px_rgba(108,99,255,0.5)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-syne"
                                >
                                    Verify & Enable
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'analytics', label: '📊 Analytics', icon: '📊' },
        { id: 'users', label: '👥 Users', icon: '👥' },
        { id: 'reports', label: '📋 Reports', icon: '📋' },
        { id: 'audit', label: '🕵️ Audit Log', icon: '🕵️' },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a1a2e',
                borderColor: 'rgba(108,99,255,0.3)',
                borderWidth: 1,
                titleFont: { family: "'DM Sans', sans-serif", size: 13 },
                bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
                padding: 12,
                cornerRadius: 10,
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 }, precision: 0 },
                beginAtZero: true
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F]">
            <Navbar />
            <div className="p-5 sm:p-10 fade-in pb-24 pt-20">
                <div className="max-w-5xl mx-auto">

                <div className="glass-compose p-8 rounded-3xl mb-8 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-4 mb-3 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
                            👑
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-syne">Master Control Panel</h1>
                            <p className="text-white/60 text-sm mt-1">Analytics, moderation, permissions & audit trail</p>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 fade-in" style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
                        <span className="text-teal-400">⚡</span>
                        <p className="text-teal-50 font-medium text-sm">{message}</p>
                    </div>
                )}

                <div className="flex gap-2 mb-8 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {analyticsLoading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"></div>)}
                            </div>
                        ) : analytics ? (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Users', value: analytics.totalUsers, gradient: 'from-[#6C63FF]/15 to-[#6C63FF]/5', border: '#6C63FF', color: '#A78BFA', icon: '👥' },
                                        { label: 'Active This Week', value: analytics.activeUsersThisWeek, gradient: 'from-[#00D4AA]/15 to-[#00D4AA]/5', border: '#00D4AA', color: '#00D4AA', icon: '🔥' },
                                        { label: 'Total Posts', value: analytics.engagement.totalPosts, gradient: 'from-[#F97316]/15 to-[#F97316]/5', border: '#F97316', color: '#FB923C', icon: '📝' },
                                        { label: 'Total Engagement', value: analytics.engagement.totalLikes + analytics.engagement.totalComments, gradient: 'from-[#FF6B6B]/15 to-[#FF6B6B]/5', border: '#FF6B6B', color: '#FCA5A5', icon: '💬' },
                                    ].map((stat, i) => (
                                        <div key={i} className={`bg-gradient-to-br ${stat.gradient} border rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`} style={{ borderColor: `${stat.border}20` }}>
                                            <div className="absolute top-3 right-3 text-2xl opacity-60 group-hover:scale-125 transition-transform">{stat.icon}</div>
                                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                                            <p className="text-3xl font-extrabold font-syne" style={{ color: stat.color }}>{stat.value.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-white font-bold text-[15px]">User Growth</h3>
                                                <p className="text-white/30 text-[11px] mt-0.5">Last 6 months registrations</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                                            </div>
                                        </div>
                                        <div style={{ height: 220 }}>
                                            <Line
                                                data={{
                                                    labels: analytics.userGrowth.labels,
                                                    datasets: [{
                                                        data: analytics.userGrowth.data,
                                                        borderColor: '#6C63FF',
                                                        backgroundColor: (ctx) => {
                                                            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
                                                            gradient.addColorStop(0, 'rgba(108,99,255,0.3)');
                                                            gradient.addColorStop(1, 'rgba(108,99,255,0.0)');
                                                            return gradient;
                                                        },
                                                        fill: true,
                                                        tension: 0.4,
                                                        borderWidth: 3,
                                                        pointRadius: 5,
                                                        pointBackgroundColor: '#6C63FF',
                                                        pointBorderColor: '#1a1a2e',
                                                        pointBorderWidth: 3,
                                                        pointHoverRadius: 8,
                                                    }]
                                                }}
                                                options={chartOptions}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-white font-bold text-[15px]">Role Distribution</h3>
                                                <p className="text-white/30 text-[11px] mt-0.5">By user type</p>
                                            </div>
                                        </div>
                                        <div style={{ height: 200 }} className="flex items-center justify-center">
                                            <Doughnut
                                                data={{
                                                    labels: analytics.roleDistribution.map(r => r.role),
                                                    datasets: [{
                                                        data: analytics.roleDistribution.map(r => r.count),
                                                        backgroundColor: ['#6C63FF', '#00D4AA', '#F97316', '#FF6B6B', '#A78BFA'],
                                                        borderColor: '#0A0A0F',
                                                        borderWidth: 3,
                                                        hoverOffset: 6,
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    cutout: '65%',
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom',
                                                            labels: {
                                                                color: 'rgba(255,255,255,0.5)',
                                                                font: { size: 11, family: "'DM Sans'" },
                                                                padding: 12,
                                                                usePointStyle: true,
                                                                pointStyleWidth: 8,
                                                            }
                                                        },
                                                        tooltip: {
                                                            backgroundColor: '#1a1a2e',
                                                            borderColor: 'rgba(108,99,255,0.3)',
                                                            borderWidth: 1,
                                                            padding: 10,
                                                            cornerRadius: 10,
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {analytics.categoryStats.length > 0 && (
                                    <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-white font-bold text-[15px]">Posts by Category</h3>
                                                <p className="text-white/30 text-[11px] mt-0.5">Content distribution across topics</p>
                                            </div>
                                        </div>
                                        <div style={{ height: 200 }}>
                                            <Bar
                                                data={{
                                                    labels: analytics.categoryStats.map(c => c.category),
                                                    datasets: [{
                                                        data: analytics.categoryStats.map(c => c.count),
                                                        backgroundColor: ['#6C63FF', '#00D4AA', '#F97316', '#FF6B6B', '#A78BFA', '#FFD93D', '#38BDF8'],
                                                        borderRadius: 8,
                                                        borderSkipped: false,
                                                        maxBarThickness: 48,
                                                    }]
                                                }}
                                                options={chartOptions}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Likes', value: analytics.engagement.totalLikes, icon: '❤️' },
                                        { label: 'Total Comments', value: analytics.engagement.totalComments, icon: '💬' },
                                        { label: 'Stories Created', value: analytics.engagement.totalStories, icon: '📖' },
                                        { label: 'Audit Actions', value: analytics.totalAuditActions, icon: '🔒' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center hover:bg-white/[0.04] transition group">
                                            <span className="text-xl mb-2 inline-block group-hover:scale-110 transition-transform">{s.icon}</span>
                                            <p className="text-white/80 text-xl font-extrabold font-syne">{s.value.toLocaleString()}</p>
                                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="glass-compose rounded-3xl p-2 sm:p-6">
                        <div className="px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05]">
                            <h2 className="text-white/80 font-bold text-sm uppercase tracking-wider">Network Users ({usersList.length})</h2>
                            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors w-full sm:w-48"
                                    />
                                </div>
                                <button onClick={handleExportCSV} className="text-white/40 hover:text-white transition text-sm flex items-center gap-1 shrink-0 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/10">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    CSV
                                </button>
                                <button onClick={fetchUsers} className="text-white/40 hover:text-white transition text-sm flex items-center gap-1 shrink-0 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {selectedUsers.size > 0 && (
                            <div className="mx-4 mb-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 fade-in">
                                <p className="text-indigo-300 text-sm font-bold">{selectedUsers.size} user(s) selected</p>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleBulkAction('grant')}
                                        disabled={bulkActionLoading}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30 hover:bg-[#00D4AA]/25 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {bulkActionLoading ? '...' : `✨ Grant All (${selectedUsers.size})`}
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('revoke')}
                                        disabled={bulkActionLoading}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B6B]/15 text-[#FF6B6B] border border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/25 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {bulkActionLoading ? '...' : `🔒 Revoke All (${selectedUsers.size})`}
                                    </button>
                                    <button
                                        onClick={() => setSelectedUsers(new Set())}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/50 hover:bg-white/10 transition"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="px-4 mb-2">
                            <label className="flex items-center gap-2 text-white/30 text-xs cursor-pointer hover:text-white/50 transition w-fit">
                                <input
                                    type="checkbox"
                                    checked={usersList.length > 0 && selectedUsers.size === usersList.length}
                                    onChange={toggleSelectAll}
                                    className="rounded accent-indigo-500"
                                />
                                Select all
                            </label>
                        </div>

                        <div className="flex flex-col gap-2">
                            {loading ? (
                                <div className="p-10 text-center text-white/30 text-sm animate-pulse">Loading network database...</div>
                            ) : usersList.length === 0 ? (
                                <div className="p-10 text-center text-white/40 text-sm">No users found matching your criteria.</div>
                            ) : (
                                usersList.map((u, i) => (
                                    <div key={u._id} className="group p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-[#151520]/80 hover:shadow-lg border border-transparent hover:border-white/5" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(u._id)}
                                                onChange={() => toggleSelectUser(u._id)}
                                                className="rounded accent-indigo-500 w-4 h-4 shrink-0"
                                            />
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
                                            className="sm:w-auto w-full px-6 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                                            style={{
                                                background: u.canPost ? 'linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,107,107,0.05))' : 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.05))',
                                                color: u.canPost ? '#FF6B6B' : '#00D4AA',
                                                border: `1px solid ${u.canPost ? 'rgba(255,107,107,0.3)' : 'rgba(0,212,170,0.3)'}`,
                                                boxShadow: u.canPost ? '0 4px 15px rgba(255,107,107,0.1)' : '0 4px 15px rgba(0,212,170,0.15)'
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
                )}

                {activeTab === 'reports' && (
                    <div className="glass-compose rounded-3xl p-2 sm:p-6">
                        <div className="px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05]">
                            <h2 className="text-white/80 font-bold text-sm uppercase tracking-wider">Content Reports ({reportsList.length})</h2>
                            <button onClick={fetchReports} className="text-white/40 hover:text-white transition text-sm flex items-center gap-1 shrink-0 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                Refresh
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {reportsLoading ? (
                                <div className="p-10 text-center text-white/30 text-sm animate-pulse">Loading reports...</div>
                            ) : reportsList.length === 0 ? (
                                <div className="p-10 text-center text-white/40 text-sm">No reports to review! 🎉</div>
                            ) : (
                                reportsList.map((r, i) => (
                                    <div key={r._id} className="group p-5 rounded-3xl flex flex-col gap-4 transition-all duration-300 bg-[#151520]/60 hover:bg-[#151520] border border-white/5 hover:border-white/10 hover:shadow-xl backdrop-blur-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${r.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]' : r.status === 'resolved' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                                                    {r.status}
                                                </span>
                                                <span className="text-white/30 text-xs">Target: <strong className="text-white/50">{r.targetType}</strong></span>
                                            </div>
                                            <span className="text-white/20 text-[10px]">{new Date(r.createdAt).toLocaleString()}</span>
                                        </div>

                                        <div>
                                            <p className="text-white/90 text-sm font-semibold mb-1">Reason: {r.reason}</p>
                                            {r.details && <p className="text-white/50 text-xs italic bg-white/5 p-2 rounded-lg border border-white/5 mb-2">{r.details}</p>}
                                            <p className="text-white/30 text-xs mt-2">Reported by: @{r.reporter?.username || 'unknown'}</p>
                                        </div>

                                        {r.status === 'pending' && (
                                            <div className="flex gap-3 mt-2 pt-4 border-t border-white/[0.04]">
                                                <button onClick={() => updateReportStatus(r._id, 'resolved', 'Action taken')} className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500/20 to-teal-500/10 text-teal-400 hover:from-teal-500/30 hover:to-teal-500/20 border border-teal-500/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:scale-[1.02] active:scale-95">Resolve Report</button>
                                                <button onClick={() => updateReportStatus(r._id, 'dismissed')} className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all duration-300 hover:scale-[1.02] active:scale-95">Dismiss</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="glass-compose rounded-3xl p-2 sm:p-6">
                        <div className="px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05]">
                            <div>
                                <h2 className="text-white/80 font-bold text-sm uppercase tracking-wider">Admin Activity Log</h2>
                                <p className="text-white/30 text-[11px] mt-1">Complete audit trail of admin actions</p>
                            </div>
                            <button onClick={fetchAuditLogs} className="text-white/40 hover:text-white transition text-sm flex items-center gap-1 shrink-0 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                Refresh
                            </button>
                        </div>

                        {auditLoading ? (
                            <div className="p-10 text-center text-white/30 text-sm animate-pulse">Loading audit trail...</div>
                        ) : auditLogs.length === 0 ? (
                            <div className="p-10 text-center text-white/40 text-sm">No audit entries yet. Actions will appear here as admins perform operations.</div>
                        ) : (
                            <div className="relative px-4">
                                <div className="absolute left-[29px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#6C63FF]/30 via-white/5 to-transparent"></div>

                                <div className="space-y-1">
                                    {auditLogs.map((log, i) => {
                                        const actionCfg = ACTION_COLORS[log.action] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)', label: log.action };
                                        return (
                                            <div key={log._id} className="relative pl-14 py-4 group hover:bg-white/[0.01] rounded-2xl transition-all" style={{ animationDelay: `${i * 0.03}s` }}>
                                                <div
                                                    className="absolute left-3 top-5 w-5 h-5 rounded-full border-2 z-10 group-hover:scale-125 transition-transform"
                                                    style={{ backgroundColor: actionCfg.bg, borderColor: actionCfg.border }}
                                                ></div>

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span
                                                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest"
                                                            style={{ background: actionCfg.bg, color: actionCfg.text, border: `1px solid ${actionCfg.border}` }}
                                                        >
                                                            {actionCfg.label}
                                                        </span>
                                                        <span className="text-white/70 text-[13px] font-medium">
                                                            {log.actorId?.name || 'System'}
                                                        </span>
                                                        {log.targetId && (
                                                            <>
                                                                <span className="text-white/20">→</span>
                                                                <span className="text-white/50 text-[13px]">
                                                                    {log.targetId?.name || log.targetId?.username || 'Target'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {log.ipAddress && (
                                                            <span className="text-white/15 text-[10px] font-mono bg-white/[0.03] px-2 py-0.5 rounded">{log.ipAddress}</span>
                                                        )}
                                                        <span className="text-white/25 text-[11px] whitespace-nowrap">{timeAgo(log.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                    <p className="text-white/20 text-[11px] mt-1.5 pl-0.5 font-mono">
                                                        {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
        </div>
    );
};

export default AdminDashboard;