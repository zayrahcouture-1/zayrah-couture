const express = require("express");
const router = express.Router();

const authController = require("../../controllers/admin/Auth.js");

router.get("/login", authController.loadLogin);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

module.exports = router;