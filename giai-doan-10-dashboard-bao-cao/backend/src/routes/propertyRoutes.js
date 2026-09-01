const express = require("express");
const propertyController = require("../controllers/propertyController");
const { authMiddleware, staffOnly } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const router = express.Router();
router.use(authMiddleware, staffOnly);
router.get("/", propertyController.list);
router.get("/:id", propertyController.getOne);
router.post("/", upload.single("image"), propertyController.create);
router.put("/:id", upload.single("image"), propertyController.update);
router.delete("/:id", propertyController.remove);

module.exports = router;
