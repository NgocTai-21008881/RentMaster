const express = require("express");
const propertyService = require("../services/propertyService");
const roomService = require("../services/roomService");
const roomRepository = require("../repositories/roomRepository");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/properties", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await propertyService.listProperties({ ...req.query, status: "active", limit: req.query.limit || 12 }) });
}));

router.get("/properties/:id", asyncHandler(async (req, res) => {
  const property = await propertyService.getProperty(req.params.id);
  const rooms = await roomService.listRooms({ property_id: req.params.id, limit: 50 });
  res.json({ success: true, data: { ...property, rooms: rooms.items } });
}));

router.get("/rooms", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await roomService.listRooms({ ...req.query, limit: req.query.limit || 12 }) });
}));

router.get("/rooms/:id", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await roomService.getRoom(req.params.id) });
}));

router.get("/stats", asyncHandler(async (req, res) => {
  const [properties, rooms] = await Promise.all([
    propertyService.listProperties({ status: "active", limit: 1 }),
    roomRepository.countStats(),
  ]);
  res.json({
    success: true,
    data: {
      properties: properties.total,
      rooms: Number(rooms.total) || 0,
      vacant: Number(rooms.vacant) || 0,
      occupied: Number(rooms.occupied) || 0,
    },
  });
}));

module.exports = router;
