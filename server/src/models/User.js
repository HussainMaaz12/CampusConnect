const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: false,
        },
        googleId: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            default: "Hey there! I am using CampusConnect.",
            trim: true,
            maxlength: [160, "Bio cannot exceed 160 characters"],
        },
        department: {
            type: String,
            default: "",
            trim: true,
        },
        year: {
            type: Number,
            default: null,
        },
        interests: [{
            type: String,
            trim: true,
        }],
        socialLinks: {
            linkedin: { type: String, default: "" },
            github: { type: String, default: "" },
            twitter: { type: String, default: "" },
            instagram: { type: String, default: "" },
        },
        avatar: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ['user', 'student', 'moderator', 'admin', 'super-admin'],
            default: 'student'
        },
        canPost: {
            type: Boolean,
            default: true
        },
        twoFactorSecret: {
            type: String,
            default: null,
        },
        isTwoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);


userSchema.index({ name: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;