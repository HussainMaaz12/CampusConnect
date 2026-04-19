import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Feed() {
    const { authUser } = useAuth();

    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState("");
    const [commentInputs, setCommentInputs] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [creatingPost, setCreatingPost] = useState(false);
    const [likingPostId, setLikingPostId] = useState(null);
    const [commentingPostId, setCommentingPostId] = useState(null);
    const [error, setError] = useState("");

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
            });

            if (response.data.success) {
                setPostContent("");
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
                        Welcome back, {authUser?.name || "User"} 👋 Share what’s happening on campus.
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

                        <button
                            type="submit"
                            disabled={creatingPost}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed px-5 py-3 rounded-xl text-black font-semibold transition"
                        >
                            {creatingPost ? "Posting..." : "Post"}
                        </button>
                    </form>
                </div>

                {/* Feed List */}
                <div className="space-y-6">
                    {loadingPosts ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                            <p className="text-zinc-400">Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                            <p className="text-zinc-400">No posts yet. Be the first to post!</p>
                        </div>
                    ) : (
                        posts.map((post) => {
                            const isLiked = isPostLikedByCurrentUser(post);

                            return (
                                <div
                                    key={post._id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {post.author?.name || "Unknown User"}
                                            </h3>
                                            <p className="text-sm text-zinc-400">
                                                @{post.author?.username || "unknown"}
                                            </p>
                                        </div>

                                        <p className="text-xs text-zinc-500">
                                            {new Date(post.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <p className="text-zinc-200 leading-relaxed mb-4">{post.content}</p>

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