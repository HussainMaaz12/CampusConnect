const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { uploadToCloudinary } = require("../config/cloudinary");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};




const registerUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const existingUsername = await User.findOne({
            username: username.toLowerCase(),
        });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: "Username already taken",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name: name.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                followers: user.followers || [],
                following: user.following || [],
            },
        });
    } catch (error) {
        console.error("Register error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};




const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                followers: user.followers || [],
                following: user.following || [],
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error during login",
        });
    }
};




const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                followers: user.followers || [],
                following: user.following || [],
            },
        });
    } catch (error) {
        console.error("Get me error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching user",
        });
    }
};




const updateProfile = async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (name && name.trim()) {
            user.name = name.trim();
        }

        if (bio !== undefined) {
            user.bio = bio.trim();
        }

        if (avatar !== undefined) {
            if (avatar === "") {
                
                user.avatar = "";
            } else if (typeof avatar === "string" && avatar.startsWith("data:")) {
                
                try {
                    const result = await uploadToCloudinary(avatar, "campusconnect/avatars", "image");
                    user.avatar = result.url;
                } catch (uploadErr) {
                    console.error("Avatar upload error:", uploadErr.message);
                    
                    if (avatar.length < 2_000_000) {
                        user.avatar = avatar;
                    }
                }
            } else if (typeof avatar === "string" && avatar.length < 2_000_000) {
                user.avatar = avatar;
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                followers: user.followers || [],
                following: user.following || [],
            },
        });
    } catch (error) {
        console.error("Update profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while updating profile",
        });
    }
};




const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username.toLowerCase() })
            .select("name username bio avatar followers following createdAt")
            .populate("followers", "name username avatar")
            .populate("following", "name username avatar");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get public profile error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};




const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id.toString();

        if (targetUserId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself",
            });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isFollowing = currentUser.following.some(
            (id) => id.toString() === targetUserId
        );

        if (isFollowing) {
            
            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== targetUserId
            );
            targetUser.followers = targetUser.followers.filter(
                (id) => id.toString() !== currentUserId
            );
        } else {
            
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            success: true,
            message: isFollowing ? "Unfollowed" : "Following",
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length,
        });
    } catch (error) {
        console.error("Toggle follow error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};




const getSuggestions = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const followingIds = currentUser.following.map((id) => id.toString());
        followingIds.push(req.user._id.toString());

        const suggestions = await User.find({
            _id: { $nin: followingIds },
        })
            .select("name username bio avatar followers")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            users: suggestions,
        });
    } catch (error) {
        console.error("Get suggestions error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};




const googleLogin = async (req, res) => {
    try {
        const { credential, googleUser: clientGoogleUser } = req.body;

        if (!credential && !clientGoogleUser) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }

        let googleUserData;

        
        if (credential) {
            try {
                const response = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    { headers: { Authorization: `Bearer ${credential}` } }
                );

                if (!response.ok) {
                    throw new Error("Invalid Google access token");
                }

                googleUserData = await response.json();
            } catch (fetchError) {
                
                if (clientGoogleUser && clientGoogleUser.email) {
                    googleUserData = clientGoogleUser;
                } else {
                    return res.status(401).json({
                        success: false,
                        message: "Failed to verify Google token",
                    });
                }
            }
        } else {
            googleUserData = clientGoogleUser;
        }

        const { sub: googleId, email, name, picture } = googleUserData;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Could not retrieve email from Google",
            });
        }

        
        let user = await User.findOne({
            $or: [
                ...(googleId ? [{ googleId }] : []),
                { email: email.toLowerCase() },
            ],
        });

        if (user) {
            
            if (!user.googleId && googleId) {
                user.googleId = googleId;
                if (picture && !user.avatar) {
                    user.avatar = picture;
                }
                await user.save();
            }
        } else {
            
            
            const displayName = name || email.split("@")[0];
            const baseUsername = displayName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .slice(0, 15);
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                name: (name || email.split("@")[0]).trim(),
                username,
                email: email.toLowerCase().trim(),
                googleId: googleId || null,
                avatar: picture || "",
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                followers: user.followers || [],
                following: user.following || [],
            },
        });
    } catch (error) {
        console.error("Google login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Google authentication failed",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    getPublicProfile,
    toggleFollow,
    getSuggestions,
    googleLogin,
};