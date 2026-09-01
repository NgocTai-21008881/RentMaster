const express = require("express");
const contractController = require("../controllers/contractController");
const { authMiddleware, staffOnly, tenantOnly, attachTenant } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const router = express.Router();
router.use(authMiddleware, attachTenant);
router.post("/apply", tenantOnly, contractController.apply);
router.get("/", contractController.list);
router.get("/:id/pdf", contractController.pdf);
router.get("/:id", contractController.getOne);
router.post("/:id/confirm", contractController.confirm);
router.post("/", staffOnly, upload.single("file"), contractController.create);
router.put("/:id", staffOnly, upload.single("file"), contractController.update);
router.post("/:id/activate", staffOnly, contractController.activate);
router.post("/:id/terminate", staffOnly, contractController.terminate);
router.post("/:id/renew", staffOnly, contractController.renew);

module.exports = router;
