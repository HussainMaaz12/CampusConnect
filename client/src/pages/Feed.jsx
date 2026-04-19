import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Feed() {
    const { authUser } = useAuth();

    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState("");
    const [postCategory, setPostCategory] = useState("General");
    const [commentInputs, setCommentInputs] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [creatingPost, setCreatingPost] = useState(false);
    const [likingPostId, setLikingPostId] = useState(null);
    const [commentingPostId, setCommentingPostId] = useState(null);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [error, setError] = useState("");

    // Edit state
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("General");
    const [savingEdit, setSavingEdit] = useState(false);

    // Search & filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    const categories = ["General", "Academic", "Events", "Clubs", "Lost & Found", "Hostel", "Confession"];

    const categoryColors = {
        General: "bg-zinc-700 text-zinc-200",
        Academic: "bg-blue-600/20 text-blue-400 border border-blue-500/30",
        Events: "bg-purple-600/20 text-purple-400 border border-purple-500/30",
        Clubs: "bg-green-600/20 text-green-400 border border-green-500/30",
        "Lost & Found": "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30",
        Hostel: "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30",
        Confession: "bg-pink-600/20 text-pink-400 border border-pink-500/30",
    };

    // Filtered posts based on search + category
    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            // Category filter
            if (filterCategory !== "All" && post.category !== filterCategory) {
                return false;
            }

            // Search filter (content, name, username)
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesContent = post.content?.toLowerCase().includes(q);
                const matchesName = post.author?.name?.toLowerCase().includes(q);
                const matchesUsername = post.author?.username?.toLowerCase().includes(q);
                return matchesContent || matchesName || matchesUsername;
            }

            return true;
        });
    }, [posts, searchQuery, filterCategory]);

    // Fetch all posts
    const fetchPosts = async () => {
        try {
            setLoadingPosts(true);
            const response = await api.get("/posts");

            if (response.data.success) {
                setPosts(response.data.posts);
            }
        } catch (err) {
            console.error("Fetch posts error:", err);
            setError("Failed to load posts");
        } finally {
            setLoadingPosts(false);
        }
    };

    // Create new post
    const handleCreatePost = async (e) => {
        e.preventDefault();
        setError("");

        if (!postContent.trim()) {
            setError("Post content cannot be empty");
            return;
        }

        try {
            setCreatingPost(true);

            const response = await api.post("/posts", {
                content: postContent,
                category: postCategory,
            });

            if (response.data.success) {
                setPostContent("");
                setPostCategory("General");
                await fetchPosts();
            }
        } catch (err) {
            console.error("Create post error:", err);
            setError(err.response?.data?.message || "Failed to create post");
        } finally {
            setCreatingPost(false);
        }
    };

    // Like / Unlike post
    const handleToggleLike = async (postId) => {
        try {
            setLikingPostId(postId);

            const response = await api.put(`/posts/${postId}/like`);

            if (response.data.success) {
                await fetchPosts();
            }
        } catch (err) {
            console.error("Like post error:", err);
            setError(err.response?.data?.message || "Failed to like post");
        } finally {
            setLikingPostId(null);
        }
    };

    // Add comment to post
    const handleAddComment = async (postId) => {
        const text = commentInputs[postId];

        if (!text || !text.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        try {
            setCommentingPostId(postId);

            const response = await api.post(`/posts/${postId}/comment`, {
                text,
            });

            if (response.data.success) {
                setCommentInputs((prev) => ({
                    ...prev,
                    [postId]: "",
                }));

                await fetchPosts();
            }
        } catch (err) {
            console.error("Add comment error:", err);
            setError(err.response?.data?.message || "Failed to add comment");
        } finally {
            setCommentingPostId(null);
        }
    };

    // Delete own post
    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            setDeletingPostId(postId);

            const response = await api.delete(`/posts/${postId}`);

            if (response.data.success) {
                await fetchPosts();
            }
        } catch (err) {
            console.error("Delete post error:", err);
            setError(err.response?.data?.message || "Failed to delete post");
        } finally {
            setDeletingPostId(null);
        }
    };

    // Start editing a post
    const startEditing = (post) => {
        setEditingPostId(post._id);
        setEditContent(post.content);
        setEditCategory(post.category || "General");
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingPostId(null);
        setEditContent("");
        setEditCategory("General");
    };

    // Save edited post
    const handleSaveEdit = async (postId) => {
        if (!editContent.trim()) {
            setError("Post content cannot be empty");
            return;
        }

        try {
            setSavingEdit(true);
            setError("");

            const response = await api.put(`/posts/${postId}`, {
                content: editContent,
                category: editCategory,
            });

            if (response.data.success) {
                cancelEditing();
                await fetchPosts();
            }
        } catch (err) {
            console.error("Edit post error:", err);
            setError(err.response?.data?.message || "Failed to edit post");
        } finally {
            setSavingEdit(false);
        }
    };

    // Check if current user already liked the post
    const isPostLikedByCurrentUser = (post) => {
        if (!authUser) return false;

        return post.likes?.some((likeUserId) => likeUserId === authUser._id);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-orange-500">Campus Feed</h1>
                    <p className="text-zinc-400 mt-2">
                        Welcome back, {authUser?.name || "User"} 👋 Share what's happening on campus.
                    </p>
                </div>

                {/* Error Box */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {/* Create Post Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-lg">
                    <h2 className="text-2xl font-semibold text-orange-400 mb-4">Create a Post</h2>

                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="What's happening on campus today?"
                            rows="4"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500 resize-none"
                        />

                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={postCategory}
                                onChange={(e) => setPostCategory(e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-white appearance-none cursor-pointer"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={creatingPost}
                                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed px-5 py-3 rounded-xl text-black font-semibold transition"
                            >
                                {creatingPost ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8 shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="🔍 Search by content, name, or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                        />

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-white appearance-none cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(searchQuery || filterCategory !== "All") && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-zinc-400">
                            <span>
                                Showing {filteredPosts.length} of {posts.length} posts
                            </span>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterCategory("All");
                                }}
                                className="text-orange-400 hover:text-orange-300 ml-auto transition"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Feed List */}
                <div className="space-y-6">
                    {loadingPosts ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                            <p className="text-zinc-400">Loading posts...</p>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                            <p className="text-zinc-400">
                                {posts.length === 0
                                    ? "No posts yet. Be the first to post!"
                                    : "No posts match your search."}
                            </p>
                        </div>
                    ) : (
                        filteredPosts.map((post) => {
                            const isLiked = isPostLikedByCurrentUser(post);
                            const isEditing = editingPostId === post._id;
                            const isOwner = authUser?._id === post.author?._id;

                            return (
                                <div
                                    key={post._id}
                                    className={`bg-zinc-900 border rounded-2xl p-6 shadow-lg ${
                                        isEditing ? "border-orange-500/50" : "border-zinc-800"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {post.author?.name || "Unknown User"}
                                                </h3>
                                                {!isEditing && post.category && (
                                                    <span
                                                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[post.category] || categoryColors.General}`}
                                                    >
                                                        {post.category}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-400">
                                                @{post.author?.username || "unknown"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-zinc-500">
                                                {new Date(post.createdAt).toLocaleString()}
                                            </p>
                                            {isOwner && !isEditing && (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(post)}
                                                        className="text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 p-1.5 rounded-lg transition text-sm"
                                                        title="Edit post"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        disabled={deletingPostId === post._id}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 p-1.5 rounded-lg transition text-sm"
                                                        title="Delete post"
                                                    >
                                                        {deletingPostId === post._id ? "..." : "🗑️"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Post Content — Edit Mode or Display Mode */}
                                    {isEditing ? (
                                        <div className="mb-4 space-y-3">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows="3"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500 resize-none"
                                            />
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <select
                                                    value={editCategory}
                                                    onChange={(e) => setEditCategory(e.target.value)}
                                                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-white appearance-none cursor-pointer"
                                                >
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>
                                                            {cat}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(post._id)}
                                                        disabled={savingEdit}
                                                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-70 px-4 py-2 rounded-xl text-black font-semibold transition"
                                                    >
                                                        {savingEdit ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-white font-medium transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-zinc-200 leading-relaxed mb-4">{post.content}</p>
                                    )}

                                    {/* Like + Comment Count */}
                                    <div className="flex gap-4 text-sm border-t border-zinc-800 pt-4 mb-4">
                                        <button
                                            onClick={() => handleToggleLike(post._id)}
                                            disabled={likingPostId === post._id}
                                            className={`px-4 py-2 rounded-xl transition font-medium ${isLiked
                                                ? "bg-orange-500 text-black hover:bg-orange-600"
                                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                                }`}
                                        >
                                            {likingPostId === post._id
                                                ? "Updating..."
                                                : isLiked
                                                    ? `❤️ Liked (${post.likes?.length || 0})`
                                                    : `🤍 Like (${post.likes?.length || 0})`}
                                        </button>

                                        <div className="flex items-center text-zinc-400">
                                            💬 {post.comments?.length || 0} Comments
                                        </div>
                                    </div>

                                    {/* Add Comment */}
                                    <div className="border-t border-zinc-800 pt-4">
                                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={commentInputs[post._id] || ""}
                                                onChange={(e) =>
                                                    setCommentInputs((prev) => ({
                                                        ...prev,
                                                        [post._id]: e.target.value,
                                                    }))
                                                }
                                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                                            />

                                            <button
                                                onClick={() => handleAddComment(post._id)}
                                                disabled={commentingPostId === post._id}
                                                className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-70 disabled:cursor-not-allowed px-4 py-3 rounded-xl text-white font-medium transition"
                                            >
                                                {commentingPostId === post._id ? "Adding..." : "Comment"}
                                            </button>
                                        </div>

                                        {/* Comments List */}
                                        <div className="space-y-3">
                                            {post.comments?.length > 0 ? (
                                                post.comments.map((comment, index) => (
                                                    <div
                                                        key={comment._id || index}
                                                        className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3"
                                                    >
                                                        <p className="text-sm text-orange-400 font-medium mb-1">
                                                            {comment.user?.name || "Unknown User"}{" "}
                                                            <span className="text-zinc-500">
                                                                @{comment.user?.username || "unknown"}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm text-zinc-200">{comment.text}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-zinc-500">No comments yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Feed;