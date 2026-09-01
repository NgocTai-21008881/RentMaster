const notificationRepository = require("../repositories/notificationRepository");
const { asyncHandler } = require("../middleware/errorHandler");
const { paginate } = require("../utils/helpers");

module.exports = {
  list: asyncHandler(async (req, res) => {
    const paging = paginate(req.query);
    res.json({ success: true, data: await notificationRepository.listByUser(req.user.id, paging) });
  }),
  read: asyncHandler(async (req, res) => {
    await notificationRepository.markRead(req.params.id, req.user.id);
    res.json({ success: true });
  }),
  readAll: asyncHandler(async (req, res) => {
    await notificationRepository.markAllRead(req.user.id);
    res.json({ success: true });
  }),
};
