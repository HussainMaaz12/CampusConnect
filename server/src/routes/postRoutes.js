const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllPosts);
router.get("/user/:userId", getUserPosts);

// Private routes
router.get("/my-posts", protect, getMyPosts);
router.get("/stories", protect, getStories);
router.get("/bookmarked", protect, getBookmarkedPosts);
router.post("/", protect, createPost);
router.put("/:id/like", protect, toggleLikePost);
router.put("/:id/bookmark", protect, toggleBookmark);
router.put("/:id/share", protect, sharePost);
router.post("/:id/comment", protect, addCommentToPost);
router.put("/:id", protect, editPost);
router.delete("/:id", protect, deletePost);

module.exports = router;