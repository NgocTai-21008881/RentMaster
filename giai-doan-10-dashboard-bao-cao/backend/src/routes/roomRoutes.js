const express = require("express");
const roomController = require("../controllers/roomController");
const { authMiddleware, staffOnly } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const router = express.Router();
router.use(authMiddleware);
router.get("/", roomController.list);
router.get("/:id", roomController.getOne);
router.post("/", staffOnly, upload.single("image"), roomController.create);
router.put("/:id", staffOnly, upload.single("image"), roomController.update);
router.delete("/:id", staffOnly, roomController.remove);

module.exports = router;
