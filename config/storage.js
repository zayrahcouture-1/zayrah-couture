const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder;

    if (file.fieldname === "images") {
      folder = "products";
    } else if (file.fieldname === "image") {
      folder = "categories";
    } else if (
      file.fieldname === "heroImagePrimary" ||
      file.fieldname === "heroImageSecondary"
    ) {
      folder = "hero";
    } else if (file.fieldname.startsWith("instagramPostImage")) {
      folder = "instagram";
    } else {
      return cb(new Error("Unsupported upload field"));
    }

    cb(null, path.join(UPLOAD_ROOT, folder));
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename =
      `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WebP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;