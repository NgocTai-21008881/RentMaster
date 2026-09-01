const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const publicRoutes = require("./publicRoutes");
const propertyRoutes = require("./propertyRoutes");
const roomRoutes = require("./roomRoutes");
const tenantRoutes = require("./tenantRoutes");
const contractRoutes = require("./contractRoutes");
const utilityRoutes = require("./utilityRoutes");
const serviceRoutes = require("./serviceRoutes");
const invoiceRoutes = require("./invoiceRoutes");
const paymentRoutes = require("./paymentRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const reportRoutes = require("./reportRoutes");

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
router.use("/utilities", utilityRoutes);
router.use("/services", serviceRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/payments", paymentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
