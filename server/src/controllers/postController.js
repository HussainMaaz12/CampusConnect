const Post = require("../models/Post");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

// @desc    Create a new post (with optional media)
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content, category, mediaFiles, postType } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content is required",
            });
        }

        const postData = {
            author: req.user._id,
            content: content.trim(),
            postType: postType || "post",
        };

        if (category) {
            postData.category = category;
        }

        // Handle story expiry
        if (postType === "story") {
            postData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        }

        // Upload media files to Cloudinary
        if (mediaFiles && Array.isArray(mediaFiles) && mediaFiles.length > 0) {
            const uploadedMedia = [];

            for (const file of mediaFiles.slice(0, 4)) { // Max 4 files
                try {
                    const result = await uploadToCloudinary(
                        file.data,
                        "campusconnect/posts",
                        file.type === "video" ? "video" : "image"
                    );
                    uploadedMedia.push({
                        url: result.url,
                        publicId: result.publicId,
                        type: result.type === "video" ? "video" : "image",
                    });
                } catch (uploadErr) {
                    console.error("Upload error for file:", uploadErr.message);
                }
            }

            postData.media = uploadedMedia;
        }

        const newPost = await Post.create(postData);

        const populatedPost = await Post.findById(newPost._id)
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar");

        // Emit real-time event
        const io = req.app.get("io");
        if (io) {
            io.emit("post:new", populatedPost);
        }

        res.status(201).json({
            success: true,
            message: postType === "story" ? "Story shared!" : "Post created successfully",
            post: populatedPost,
        });
    } catch (error) {
        console.error("Create post error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while creating post",
        });
    }
};

// @desc    Get all posts (excluding expired stories)
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            $or: [
                { postType: "post" },
                { postType: { $exists: false } },
                { postType: "story", expiresAt: { $gt: new Date() } },
            ],
            // Only show regular posts in the main feed
            postType: { $ne: "story" },
        })
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error("Get all posts error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching posts",
        });
    }
};

// @desc    Get active stories (last 24h)
// @route   GET /api/posts/stories
// @access  Private
const getStories = async (req, res) => {
    try {
        const stories = await Post.find({
            postType: "story",
            $or: [
                { expiresAt: { $gt: new Date() } },
                { expiresAt: null, createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            ],
        })
            .populate("author", "name username email bio avatar")
            .sort({ createdAt: -1 });

        // Group stories by author
        const grouped = {};
        stories.forEach((story) => {
            const authorId = story.author._id.toString();
            if (!grouped[authorId]) {
                grouped[authorId] = {
                    author: story.author,
                    stories: [],
                };
            }
            grouped[authorId].stories.push(story);
        });

        res.status(200).json({
            success: true,
            storyGroups: Object.values(grouped),
        });
    } catch (error) {
        console.error("Get stories error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching stories",
        });
    }
};

// @desc    Get current user's posts
// @route   GET /api/posts/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id, postType: { $ne: "story" } })
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error("Get my posts error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching your posts",
        });
    }
};

// @desc    Get posts by a specific user (public profile)
// @route   GET /api/posts/user/:userId
// @access  Public
const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId, postType: { $ne: "story" } })
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error("Get user posts error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching user posts",
        });
    }
};

// @desc    Like or unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const userId = req.user._id.toString();
        const alreadyLiked = post.likes.some((like) => like.toString() === userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter((like) => like.toString() !== userId);
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();

        // Emit real-time event
        const io = req.app.get("io");
        if (io) {
            io.emit("post:like", { postId: post._id, likes: post.likes, userId: req.user._id });
        }

        res.status(200).json({
            success: true,
            message: alreadyLiked ? "Post unliked" : "Post liked",
            post,
        });
    } catch (error) {
        console.error("Toggle like error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while toggling like",
        });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addCommentToPost = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment text is required",
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        post.comments.push({
            user: req.user._id,
            text: text.trim(),
        });

        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar");

        // Emit real-time event
        const io = req.app.get("io");
        if (io) {
            io.emit("post:comment", { postId: updatedPost._id, comments: updatedPost.comments });
        }

        res.status(200).json({
            success: true,
            message: "Comment added successfully",
            post: updatedPost,
        });
    } catch (error) {
        console.error("Add comment error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while adding comment",
        });
    }
};

// @desc    Edit own post
// @route   PUT /api/posts/:id
// @access  Private
const editPost = async (req, res) => {
    try {
        const { content, category } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // Only allow the author to edit
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own posts",
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content is required",
            });
        }

        post.content = content.trim();
        if (category) {
            post.category = category;
        }

        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar");

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post: updatedPost,
        });
    } catch (error) {
        console.error("Edit post error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while editing post",
        });
    }
};

// @desc    Delete own post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // Only allow the author to delete
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own posts",
            });
        }

        // Delete media from Cloudinary
        if (post.media && post.media.length > 0) {
            for (const m of post.media) {
                if (m.publicId) {
                    try {
                        await deleteFromCloudinary(m.publicId, m.type || "image");
                    } catch (e) {
                        console.error("Cloudinary delete error:", e.message);
                    }
                }
            }
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });
    } catch (error) {
        console.error("Delete post error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while deleting post",
        });
    }
};

// @desc    Toggle bookmark a post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const userId = req.user._id.toString();
        const isBookmarked = post.bookmarks.some((b) => b.toString() === userId);

        if (isBookmarked) {
            post.bookmarks = post.bookmarks.filter((b) => b.toString() !== userId);
        } else {
            post.bookmarks.push(req.user._id);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: isBookmarked ? "Bookmark removed" : "Post bookmarked",
            bookmarked: !isBookmarked,
        });
    } catch (error) {
        console.error("Toggle bookmark error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get user's bookmarked posts
// @route   GET /api/posts/bookmarked
// @access  Private
const getBookmarkedPosts = async (req, res) => {
    try {
        const posts = await Post.find({ bookmarks: req.user._id })
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error) {
        console.error("Get bookmarks error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Increment share count
// @route   PUT /api/posts/:id/share
// @access  Private
const sharePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { shares: 1 } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        res.status(200).json({ success: true, shares: post.shares });
    } catch (error) {
        console.error("Share post error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getStories,
    getMyPosts,
    getUserPosts,
    toggleLikePost,
    addCommentToPost,
    editPost,
    deletePost,
    toggleBookmark,
    getBookmarkedPosts,
    sharePost,
};