const express = require("express");
const router = express.Router();

const {
    createPost,
    getAllPosts,
    getMyPosts,
    toggleLikePost,
    addCommentToPost,
    deletePost,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

// Public route
router.get("/", getAllPosts);

// Private routes
router.get("/my-posts", protect, getMyPosts);
router.post("/", protect, createPost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, toggleLikePost);
router.post("/:id/comment", protect, addCommentToPost);

module.exports = router;