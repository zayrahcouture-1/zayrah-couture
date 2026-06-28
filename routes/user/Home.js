const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/user/Home");

router.get("/", homeController.getHome);
router.get("/shop", homeController.getShop);
router.get("/product/:slug", homeController.getProductDetails);
router.get("/about", homeController.getAbout);
router.get("/contact", homeController.getContact);
router.get("/checkout", homeController.getCheckout);

module.exports = router;
