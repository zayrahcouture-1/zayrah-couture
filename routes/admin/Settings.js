const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

const settingsController = require("../../controllers/admin/Settings.js");
const isAdmin = require("../../middleware/Auth.js");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "zayrah/settings",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

router.get(
  "/settings",
  isAdmin,
  settingsController.loadSettings
);

router.post(
  "/settings",
  isAdmin,
  upload.fields([
    { name: "heroImagePrimary", maxCount: 1 },
    { name: "heroImageSecondary", maxCount: 1 },
    { name: "instagramPostImage0", maxCount: 1 },
    { name: "instagramPostImage1", maxCount: 1 },
    { name: "instagramPostImage2", maxCount: 1 },
    { name: "instagramPostImage3", maxCount: 1 },
  ]),
  settingsController.updateSettings
);

module.exports = router;
