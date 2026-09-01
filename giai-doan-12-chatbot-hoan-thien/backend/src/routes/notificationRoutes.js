const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);
router.get("/", notificationController.list);
router.post("/read-all", notificationController.readAll);
router.post("/:id/read", notificationController.read);

module.exports = router;
