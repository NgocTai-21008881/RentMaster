const express = require("express");
const invoiceController = require("../controllers/invoiceController");
const { authMiddleware, staffOnly, attachTenant } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware, attachTenant);
router.get("/", invoiceController.list);
router.get("/:id/pdf", invoiceController.pdf);
router.get("/:id", invoiceController.getOne);
router.post("/", staffOnly, invoiceController.create);

module.exports = router;
