const express = require("express");
const serviceController = require("../controllers/serviceController");
const { authMiddleware, staffOnly } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware, staffOnly);
router.get("/", serviceController.list);
router.post("/", serviceController.create);
router.put("/:id", serviceController.update);
router.delete("/:id", serviceController.remove);
router.post("/rooms/:roomId", serviceController.room);

module.exports = router;
