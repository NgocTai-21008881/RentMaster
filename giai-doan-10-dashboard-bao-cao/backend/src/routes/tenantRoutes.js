const express = require("express");
const tenantController = require("../controllers/tenantController");
const { authMiddleware, staffOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware, staffOnly);
router.get("/", tenantController.list);
router.get("/:id", tenantController.getOne);
router.post("/", tenantController.create);
router.put("/:id", tenantController.update);
router.delete("/:id", tenantController.remove);

module.exports = router;
