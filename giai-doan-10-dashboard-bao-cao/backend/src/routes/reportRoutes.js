const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { authMiddleware, staffOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware, staffOnly);
router.get("/", dashboardController.report);
router.get("/export", dashboardController.export);

module.exports = router;
