const Post = require("../models/Post");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content, category } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content is required",
            });
        }

        const postData = {
            author: req.user._id,
            content: content.trim(),
        };

        if (category) {
            postData.category = category;
        }

        const newPost = await Post.create(postData);

        const populatedPost = await Post.findById(newPost._id)
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username");

        res.status(201).json({
            success: true,
            message: "Post created successfully",
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

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username")
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

// @desc    Get current user's posts
// @route   GET /api/posts/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username")
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

// @desc    Like or unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username");

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

        const post = await Post.findById(req.params.id)
            .populate("author", "name username email bio avatar")
            .populate("comments.user", "name username");

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
            .populate("comments.user", "name username");

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
            .populate("comments.user", "name username");

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

module.exports = {
    createPost,
    getAllPosts,
    getMyPosts,
    toggleLikePost,
    addCommentToPost,
    editPost,
    deletePost,
};