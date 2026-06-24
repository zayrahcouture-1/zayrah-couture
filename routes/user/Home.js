const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/user/Home");

router.get("/", homeController.getHome);
router.get("/shop", homeController.getShop);

module.exports = router;
