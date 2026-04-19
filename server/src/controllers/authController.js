const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
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

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                email: req.user.email,
                bio: req.user.bio,
                avatar: req.user.avatar,
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

// @desc    Update current user's profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;

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

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
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

        // If we have an access_token (implicit flow), verify by fetching user info from Google
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
                // Fall back to client-provided Google user data
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

        // Check if user already exists with this Google ID or email
        let user = await User.findOne({
            $or: [
                ...(googleId ? [{ googleId }] : []),
                { email: email.toLowerCase() },
            ],
        });

        if (user) {
            // Update Google ID if user exists by email but not by Google ID
            if (!user.googleId && googleId) {
                user.googleId = googleId;
                if (picture && !user.avatar) {
                    user.avatar = picture;
                }
                await user.save();
            }
        } else {
            // Create new user
            // Generate a unique username from name
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
    googleLogin,
};