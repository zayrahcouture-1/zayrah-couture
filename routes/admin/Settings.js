const express = require("express");
const router = express.Router();
const upload = require("../../config/storage");

const settingsController = require("../../controllers/admin/Settings.js");
const isAdmin = require("../../middleware/Auth.js");

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
