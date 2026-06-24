const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/user/Home");

router.get("/", homeController.getHome);

module.exports = router;
