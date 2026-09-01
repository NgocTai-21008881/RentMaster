const express = require("express");
const utilityController = require("../controllers/utilityController");
const { authMiddleware, staffOnly, attachTenant } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware, attachTenant);
router.get("/", utilityController.list);
router.post("/", staffOnly, utilityController.upsert);
router.delete("/:id", staffOnly, utilityController.remove);

module.exports = router;
