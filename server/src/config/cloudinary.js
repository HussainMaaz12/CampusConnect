const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 data-URL to Cloudinary.
 * @param {string} base64Data  – full data-URL, e.g. "data:image/png;base64,..."
 * @param {string} folder      – Cloudinary folder name
 * @param {string} resourceType – "image" | "video" | "auto"
 * @returns {{ url: string, publicId: string, type: string }}
 */
const uploadToCloudinary = async (base64Data, folder = "campusconnect", resourceType = "auto") => {
    const result = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: resourceType,
        transformation: resourceType === "image"
            ? [{ quality: "auto:good", fetch_format: "auto" }]
            : undefined,
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        type: result.resource_type, // "image" or "video"
    };
};

/**
 * Delete a file from Cloudinary by public ID.
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
