const express = require("express");
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", authController.forgot);
router.post("/reset-password", authController.reset);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.me);
router.put("/profile", authMiddleware, upload.single("avatar"), authController.updateProfile);
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
