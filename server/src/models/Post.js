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
        
        media: [
            {
                url: { type: String, required: true },
                publicId: { type: String },
                type: { type: String, enum: ["image", "video"], default: "image" },
            },
        ],
        
        postType: {
            type: String,
            enum: ["post", "story"],
            default: "post",
        },
        
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
        
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        
        shares: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);


postSchema.index({ postType: 1, expiresAt: 1 });
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;