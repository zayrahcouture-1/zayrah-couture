const express = require("express");
const router = express.Router();
const upload = require("../../config/storage");

const productController = require("../../controllers/admin/Product.js");
const isAdmin = require("../../middleware/Auth.js");

router.get(
  "/products",
  isAdmin,
  productController.loadProducts
);

router.get(
  "/products/add",
  isAdmin,
  productController.loadAddProduct
);

router.post(
  "/products/add",
  isAdmin,
  upload.array("images", 5),
  productController.addProduct
);

router.post(
  "/products/check-duplicate",
  isAdmin,
  productController.checkDuplicate
);

router.post(
  "/products/toggle-status/:id",
  isAdmin,
  productController.toggleProductStatus
);

router.post(
  "/products/toggle-featured/:id",
  isAdmin,
  productController.toggleProductFeatured
);

router.get(
  "/products/edit/:id",
  isAdmin,
  productController.loadEditProduct
);

router.post(
  "/products/edit/:id",
  isAdmin,
  upload.array("images", 5),
  productController.editProduct
);

router.post(
  "/products/delete/:id",
  isAdmin,
  productController.deleteProduct
);

module.exports = router;
