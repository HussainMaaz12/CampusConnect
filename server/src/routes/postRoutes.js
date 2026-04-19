const express = require("express");
const router = express.Router();

const {
    createPost,
    getAllPosts,
    getMyPosts,
    toggleLikePost,
    addCommentToPost,
    editPost,
    deletePost,
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

// Public route
router.get("/", getAllPosts);

// Private routes
router.get("/my-posts", protect, getMyPosts);
router.post("/", protect, createPost);
router.put("/:id/like", protect, toggleLikePost);
router.post("/:id/comment", protect, addCommentToPost);
router.put("/:id", protect, editPost);
router.delete("/:id", protect, deletePost);

module.exports = router;