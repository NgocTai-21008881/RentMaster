const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const publicRoutes = require("./publicRoutes");
const propertyRoutes = require("./propertyRoutes");
const roomRoutes = require("./roomRoutes");
const tenantRoutes = require("./tenantRoutes");
const contractRoutes = require("./contractRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API đang hoạt động.", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/public", publicRoutes);
router.use("/properties", propertyRoutes);
router.use("/rooms", roomRoutes);
router.use("/tenants", tenantRoutes);
router.use("/contracts", contractRoutes);

module.exports = router;
