const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { uploadToCloudinary } = require("../config/cloudinary");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const crypto = require("crypto");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const RefreshToken = require("../models/RefreshToken");

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};

const generateRefreshToken = (id) => {
    return crypto.randomBytes(40).toString('hex');
};

const generateTokensAndCookies = async (res, user) => {
    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);
    const familyId = crypto.randomBytes(20).toString('hex');

    await RefreshToken.create({
        userId: user._id,
        token: refreshTokenValue,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.cookie('refreshToken', refreshTokenValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return accessToken;
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

        const accessToken = await generateTokensAndCookies(res, user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: accessToken,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                department: user.department,
                year: user.year,
                interests: user.interests,
                socialLinks: user.socialLinks,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
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

        if (user.isTwoFactorEnabled && (user.role === 'admin' || user.role === 'super-admin')) {
            const tempToken = jwt.sign({ id: user._id, is2FA: true }, process.env.JWT_SECRET, { expiresIn: '10m' });
            return res.status(200).json({
                success: true,
                requires2FA: true,
                tempToken,
                message: "Please enter your 2FA code."
            });
        }

        const accessToken = await generateTokensAndCookies(res, user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: accessToken,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                department: user.department,
                year: user.year,
                interests: user.interests,
                socialLinks: user.socialLinks,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
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
                department: user.department,
                year: user.year,
                interests: user.interests,
                socialLinks: user.socialLinks,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
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

        if (req.body.department !== undefined) {
            user.department = req.body.department.trim();
        }

        if (req.body.year !== undefined) {
            user.year = req.body.year ? Number(req.body.year) : null;
        }

        if (req.body.interests !== undefined) {
            user.interests = Array.isArray(req.body.interests) ? req.body.interests : [];
        }

        if (req.body.socialLinks !== undefined) {
            user.socialLinks = {
                ...user.socialLinks,
                ...req.body.socialLinks
            };
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
                department: user.department,
                year: user.year,
                interests: user.interests,
                socialLinks: user.socialLinks,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
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
            .select("name username bio department year interests socialLinks avatar followers following createdAt role")
            .populate("followers", "name username avatar department")
            .populate("following", "name username avatar department");

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

        const accessToken = await generateTokensAndCookies(res, user);

        res.status(200).json({
            success: true,
            message: "Google login successful",
            token: accessToken,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role,
                canPost: user.canPost,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
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

const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const secret = speakeasy.generateSecret({ name: `CampusConnect (${user.email})` });

        user.twoFactorSecret = secret.base32;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return res.status(500).json({ success: false, message: "Error generating QR code" });
            res.status(200).json({
                success: true,
                qrCode: data_url,
                secret: secret.base32
            });
        });
    } catch (error) {
        console.error("Setup 2FA error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const verify2FA = async (req, res) => {
    try {
        const { tempToken, code } = req.body;
        
        let userId;
        if (tempToken) {
            const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
            userId = decoded.id;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } else if (req.user) {
            userId = req.user._id;
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findById(userId);

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code
        });

        if (!verified) {
            return res.status(400).json({ success: false, message: "Invalid 2FA code" });
        }

        user.isTwoFactorEnabled = true;
        await user.save();

        const accessToken = await generateTokensAndCookies(res, user);

        res.status(200).json({
            success: true,
            message: "2FA verified successfully",
            token: accessToken,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                canPost: user.canPost,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            },
        });
    } catch (error) {
        console.error("Verify 2FA error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const refreshSession = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token" });

    try {
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
        if (!tokenDoc) {
            res.clearCookie('refreshToken');
            return res.status(403).json({ success: false, message: "Invalid refresh token" });
        }

        if (tokenDoc.isRevoked || tokenDoc.expiresAt < new Date()) {
            await RefreshToken.deleteMany({ familyId: tokenDoc.familyId });
            res.clearCookie('refreshToken');
            return res.status(403).json({ success: false, message: "Token expired or revoked" });
        }

        const user = await User.findById(tokenDoc.userId);
        if (!user) return res.status(401).json({ success: false, message: "User not found" });

        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        tokenDoc.isRevoked = true;
        await tokenDoc.save();

        await RefreshToken.create({
            userId: user._id,
            token: newRefreshToken,
            familyId: tokenDoc.familyId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        res.status(200).json({ success: true, token: accessToken, user: { role: user.role, isTwoFactorEnabled: user.isTwoFactorEnabled } });
    } catch (error) {
        console.error("Refresh error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const logoutUser = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await RefreshToken.findOneAndDelete({ token: refreshToken });
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: "Logged out" });
};

const getDirectory = async (req, res) => {
    try {
        const { search, department, year, interest, page = 1, limit = 20 } = req.query;
        
        let query = {};
        
        // Exclude super-admins from directory if desired, or just everyone
        // query.role = { $ne: 'super-admin' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
                { bio: { $regex: search, $options: "i" } }
            ];
        }

        if (department) {
            query.department = { $regex: `^${department}$`, $options: "i" };
        }

        if (year) {
            query.year = Number(year);
        }

        if (interest) {
            query.interests = { $regex: interest, $options: "i" };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const users = await User.find(query)
            .select("name username bio department year interests avatar followers following")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
            
        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            pages: Math.ceil(total / Number(limit)),
            users,
        });
    } catch (error) {
        console.error("Directory error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching directory",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    updateProfile,
    getPublicProfile,
    toggleFollow,
    getSuggestions,
    setup2FA,
    verify2FA,
    refreshSession,
    logoutUser,
    getDirectory
};