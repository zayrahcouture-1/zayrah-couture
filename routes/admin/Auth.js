const express = require("express");
const router = express.Router();

const authController = require("../../controllers/admin/Auth.js");

router.get("/", (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect("/admin/dashboard");
  }
  return res.redirect("/admin/login");
});

router.get("/login", authController.loadLogin);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

module.exports = router;