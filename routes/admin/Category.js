const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

const categoryController = require("../../controllers/admin/Category.js");
const isAdmin = require("../../middleware/Auth.js");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "zayrah/categories",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

router.get(
  "/categories",
  isAdmin,
  categoryController.loadCategories
);

router.get(
  "/categories/add",
  isAdmin,
  categoryController.loadAddCategory
);

router.post(
  "/categories/add",
  isAdmin,
  upload.single("image"),
  categoryController.addCategory
);

router.post(
  "/categories/toggle-status/:id",
  isAdmin,
  categoryController.toggleStatus
);

router.get(
  "/categories/edit/:id",
  isAdmin,
  categoryController.loadEditCategory
);

router.post(
  "/categories/edit/:id",
  isAdmin,
  upload.single("image"),
  categoryController.editCategory
);

router.post(
  "/categories/delete/:id",
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;