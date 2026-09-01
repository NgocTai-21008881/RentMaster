const express = require("express");
const maintenanceController = require("../controllers/maintenanceController");
const { authMiddleware, staffOnly, attachTenant } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const router = express.Router();
router.use(authMiddleware, attachTenant);
router.get("/", maintenanceController.list);
router.post("/", upload.single("image"), maintenanceController.create);
router.put("/:id", staffOnly, maintenanceController.update);

module.exports = router;
