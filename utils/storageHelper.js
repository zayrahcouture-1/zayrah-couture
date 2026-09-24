const path = require("path");
const fs = require("fs").promises;

const PRODUCTS_DIR = path.resolve(__dirname, "..", "uploads", "products");
const CATEGORIES_DIR = path.resolve(__dirname, "..", "uploads", "categories");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
// Matches generated multer diskStorage filename: <timestamp>-<16 hex chars>.<ext>
// as well as standard safe alphanumeric filenames: [a-zA-Z0-9_\-]+.<ext>
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp)$/i;

/**
 * Validates whether an input represents a safe local image filename.
 * Rejects path traversal, Cloudinary public IDs, null bytes, colons, Windows drive paths, etc.
 *
 * @param {string} filenameOrPath - Filename or relative upload path
 * @param {string|null} [allowedPrefix] - Optional URL prefix to strip (e.g. "/uploads/products/")
 * @returns {string|null} Sanitized base filename if valid, null otherwise
 */
const extractSafeLocalFilename = (filenameOrPath, allowedPrefix = null) => {
  if (!filenameOrPath || typeof filenameOrPath !== "string") {
    return null;
  }

  let trimmed = filenameOrPath.trim();
  if (!trimmed || trimmed.length > 255) {
    return null;
  }

  // Reject null bytes, backslashes, colons (Windows drive letters or streams)
  if (
    trimmed.includes("\0") ||
    trimmed.includes("\\") ||
    trimmed.includes(":")
  ) {
    return null;
  }

  // If the path was passed as a browser-accessible URL, strip the known prefix
  if (allowedPrefix && trimmed.startsWith(allowedPrefix)) {
    trimmed = trimmed.slice(allowedPrefix.length);
  } else if (trimmed.startsWith("/uploads/products/")) {
    trimmed = trimmed.slice("/uploads/products/".length);
  } else if (trimmed.startsWith("/uploads/categories/")) {
    trimmed = trimmed.slice("/uploads/categories/".length);
  }

  // After stripping the prefix, there must be NO path separators or directory traversal
  if (trimmed.includes("/") || trimmed.includes("..")) {
    return null;
  }

  // Extract extension and verify against allowed list
  const ext = path.extname(trimmed).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return null;
  }

  // Ensure it matches safe alphanumeric pattern and doesn't contain spaces or weird characters
  if (!SAFE_FILENAME_REGEX.test(trimmed)) {
    return null;
  }

  return trimmed;
};

/**
 * Safely deletes a product image file from uploads/products/
 * Strictly prevents path traversal and safely ignores missing files or non-local IDs (e.g. legacy Cloudinary).
 *
 * @param {string} filenameOrPublicId - The filename or public_id stored in the database
 * @returns {Promise<boolean>} True if file was deleted, false otherwise
 */
const deleteProductImageFile = async (filenameOrPublicId) => {
  const safeFilename = extractSafeLocalFilename(
    filenameOrPublicId,
    "/uploads/products/"
  );
  if (!safeFilename) {
    return false;
  }

  const targetPath = path.resolve(PRODUCTS_DIR, safeFilename);

  // Security check: ensure path belongs strictly inside uploads/products/
  if (!targetPath.startsWith(PRODUCTS_DIR + path.sep)) {
    console.warn(
      `[Security Warning] Blocked attempt to delete file outside product uploads directory: ${targetPath}`
    );
    return false;
  }

  try {
    await fs.unlink(targetPath);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      // File does not exist locally (e.g. already deleted or legacy Cloudinary image)
      return false;
    }
    console.error(`Failed to delete product image file (${targetPath}):`, err);
    return false;
  }
};

/**
 * Safely deletes a category image file from uploads/categories/
 * Strictly prevents path traversal and safely ignores missing files or non-local IDs (e.g. legacy Cloudinary).
 *
 * @param {string} filenameOrPublicId - The filename or public_id stored in the database
 * @returns {Promise<boolean>} True if file was deleted, false otherwise
 */
const deleteCategoryImageFile = async (filenameOrPublicId) => {
  const safeFilename = extractSafeLocalFilename(
    filenameOrPublicId,
    "/uploads/categories/"
  );
  if (!safeFilename) {
    return false;
  }

  const targetPath = path.resolve(CATEGORIES_DIR, safeFilename);

  // Security check: ensure path belongs strictly inside uploads/categories/
  if (!targetPath.startsWith(CATEGORIES_DIR + path.sep)) {
    console.warn(
      `[Security Warning] Blocked attempt to delete file outside category uploads directory: ${targetPath}`
    );
    return false;
  }

  try {
    await fs.unlink(targetPath);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") {
      // File does not exist locally (e.g. already deleted or legacy Cloudinary image)
      return false;
    }
    console.error(`Failed to delete category image file (${targetPath}):`, err);
    return false;
  }
};

/**
 * Safely cleans up newly uploaded files from multer for products
 *
 * @param {Array<Express.Multer.File>} files - Array of multer file objects
 * @returns {Promise<void>}
 */
const cleanupUploadedFiles = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return;
  }

  for (const file of files) {
    try {
      const filename =
        file.filename || (file.path ? path.basename(file.path) : null);
      if (filename) {
        await deleteProductImageFile(filename);
      }
    } catch (err) {
      console.error("Error during uploaded file cleanup:", err);
    }
  }
};

/**
 * Safely cleans up a newly uploaded file from multer for a category
 *
 * @param {Express.Multer.File} file - Multer file object
 * @returns {Promise<void>}
 */
const cleanupUploadedCategoryFile = async (file) => {
  if (!file) return;
  try {
    const filename =
      file.filename || (file.path ? path.basename(file.path) : null);
    if (filename) {
      await deleteCategoryImageFile(filename);
    }
  } catch (err) {
    console.error("Error during category uploaded file cleanup:", err);
  }
};

module.exports = {
  deleteProductImageFile,
  cleanupUploadedFiles,
  deleteCategoryImageFile,
  cleanupUploadedCategoryFile,
  extractSafeLocalFilename,
  PRODUCTS_DIR,
  CATEGORIES_DIR,
};
