import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Profile() {
    const { authUser, updateAuthUser } = useAuth();

    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [editForm, setEditForm] = useState({
        name: authUser?.name || "",
        bio: authUser?.bio || "",
    });

    const fetchMyPosts = async () => {
        try {
            setLoading(true);

            const response = await api.get("/posts/my-posts");

            if (response.data.success) {
                setMyPosts(response.data.posts);
            }
        } catch (err) {
            console.error("Fetch my posts error:", err);
            setError("Failed to load profile posts");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!editForm.name.trim()) {
            setError("Name cannot be empty");
            return;
        }

        try {
            setSavingProfile(true);

            const response = await api.put("/auth/update-profile", {
                name: editForm.name,
                bio: editForm.bio,
            });

            if (response.data.success) {
                updateAuthUser(response.data.user);
                setSuccessMessage("Profile updated successfully");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, []);

    useEffect(() => {
        if (authUser) {
            setEditForm({
                name: authUser.name || "",
                bio: authUser.bio || "",
            });
        }
    }, [authUser]);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-orange-500">My Profile</h1>
                    <p className="text-zinc-400 mt-2">
                        Manage your identity, bio, and activity on CampusConnect.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {/* Success */}
                {successMessage && (
                    <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300 text-sm">
                        {successMessage}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-orange-500 text-black flex items-center justify-center text-3xl font-bold">
                            {authUser?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white">
                                {authUser?.name || "Unknown User"}
                            </h2>
                            <p className="text-orange-400 text-lg">@{authUser?.username || "unknown"}</p>
                            <p className="text-zinc-400 mt-2">{authUser?.email || "No email available"}</p>
                            <p className="text-zinc-300 mt-3">
                                {authUser?.bio || "Hey there! I am using CampusConnect."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg mb-8">
                    <h2 className="text-2xl font-semibold text-orange-400 mb-6">Edit Profile</h2>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-300 mb-2">Bio</label>
                            <textarea
                                rows="3"
                                value={editForm.bio}
                                onChange={(e) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        bio: e.target.value,
                                    }))
                                }
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed px-5 py-3 rounded-xl text-black font-semibold transition"
                        >
                            {savingProfile ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                        <p className="text-zinc-400 text-sm mb-2">Total Posts</p>
                        <h3 className="text-3xl font-bold text-orange-500">{myPosts.length}</h3>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                        <p className="text-zinc-400 text-sm mb-2">Username</p>
                        <h3 className="text-xl font-semibold text-white">
                            @{authUser?.username || "unknown"}
                        </h3>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                        <p className="text-zinc-400 text-sm mb-2">Member Status</p>
                        <h3 className="text-xl font-semibold text-white">Active Student</h3>
                    </div>
                </div>

                {/* My Posts Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-2xl font-semibold text-orange-400 mb-6">My Posts</h2>

                    {loading ? (
                        <p className="text-zinc-400">Loading your posts...</p>
                    ) : myPosts.length === 0 ? (
                        <p className="text-zinc-400">You haven’t posted anything yet.</p>
                    ) : (
                        <div className="space-y-5">
                            {myPosts.map((post) => (
                                <div
                                    key={post._id}
                                    className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-5"
                                >
                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        <h3 className="text-white font-semibold">Your Post</h3>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(post.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <p className="text-zinc-200 mb-4">{post.content}</p>

                                    <div className="flex gap-5 text-sm text-zinc-400 border-t border-zinc-700 pt-3">
                                        <span>❤️ {post.likes?.length || 0} Likes</span>
                                        <span>💬 {post.comments?.length || 0} Comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;