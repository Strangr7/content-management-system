import multer from "multer";
import logger from "../utils/logger.js";
import { APIError } from "../utils/apiError.js";

// Use memoryStorage instead of diskStorage
const storage = multer.memoryStorage();

const uploadProductImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    logger.debug(`Checking file: ${file.originalname}`, { mimetype: file.mimetype });
    if (!file.mimetype.startsWith("image/")) {
      logger.warn(`Rejected file (not an image): ${file.originalname}`);
      return cb(new APIError(400, "Only image files are allowed"), false);
    }
    cb(null, true);
  },
}).array("ProductImages", 10);

// Middleware to handle multer errors properly
const handleMulterErrors = (req, res, next) => {
  logger.debug("Starting file upload", { headers: req.headers });

  uploadProductImages(req, res, (err) => {
    if (err) {
      logger.error("File upload error", { message: err.message, stack: err.stack });

      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FILE_SIZE":
            return next(new APIError(400, "File size exceeds 5MB limit"));
          case "LIMIT_FILE_COUNT":
            return next(new APIError(400, "Too many files uploaded (max 10)"));
          default:
            return next(new APIError(400, `Multer error: ${err.message}`));
        }
      }

      return next(new APIError(400, err.message || "File upload failed"));
    }

    logger.debug("File upload completed", { files: req.files });
    next();
  });
};

export { uploadProductImages, handleMulterErrors };