const express = require("express");
const router = express.Router();

const isAdmin = require("../../middleware/Auth.js");

const dashboardController = require("../../controllers/admin/Dashboard.js");

router.get(
  "/dashboard",
  isAdmin,
  dashboardController.loadDashboard
);

module.exports = router;