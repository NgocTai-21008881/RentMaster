const express = require("express");
const userController = require("../controllers/userController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware, adminOnly);
router.get("/", userController.list);
router.post("/", userController.create);
router.get("/logs", userController.logs);
router.put("/:id", userController.update);
router.post("/:id/lock", userController.lock);
router.delete("/:id", userController.remove);

module.exports = router;
