const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authMiddleware, staffOnly, attachTenant } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware, attachTenant);
router.get("/", paymentController.list);
router.get("/qr/:invoiceId", paymentController.qr);
router.post("/", staffOnly, paymentController.create);

module.exports = router;
