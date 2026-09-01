const express = require("express");
const chatbotController = require("../controllers/chatbotController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/ask", authMiddleware, chatbotController.ask);

module.exports = router;
