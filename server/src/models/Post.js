const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: [true, "Post content is required"],
            trim: true,
            maxlength: [2000, "Post content cannot exceed 2000 characters"],
        },
        category: {
            type: String,
            enum: ["General", "Academic", "Events", "Clubs", "Lost & Found", "Hostel", "Confession"],
            default: "General",
        },
        // Media attachments (uploaded to Cloudinary)
        media: [
            {
                url: { type: String, required: true },
                publicId: { type: String },
                type: { type: String, enum: ["image", "video"], default: "image" },
            },
        ],
        // Post type: regular post or ephemeral story
        postType: {
            type: String,
            enum: ["post", "story"],
            default: "post",
        },
        // Story expiry (24h from creation)
        expiresAt: {
            type: Date,
            default: null,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                text: {
                    type: String,
                    trim: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // Bookmarks — users who saved this post
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        // Share count
        shares: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient story queries
postSchema.index({ postType: 1, expiresAt: 1 });
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;