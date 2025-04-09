import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (buffer) => {
  if (!buffer) {
    logger.warn("No buffer provided for Cloudinary upload");
    return null;
  }

  try {
    logger.debug("Uploading buffer to Cloudinary");

    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    logger.info(`File uploaded to Cloudinary: ${response.secure_url}`);
    return response;
  } catch (error) {
    logger.error(`Cloudinary upload failed: ${error.message}`, { stack: error.stack });
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error(`Cloudinary deletion failed for publicId ${publicId}: ${error.message}`, {
      stack: error.stack,
    });
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };