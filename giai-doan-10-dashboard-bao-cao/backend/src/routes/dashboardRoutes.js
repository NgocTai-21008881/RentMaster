const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { authMiddleware, staffOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/summary", authMiddleware, staffOnly, dashboardController.summary);

module.exports = router;
