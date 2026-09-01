const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API đang hoạt động.", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;
