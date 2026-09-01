const chatbotService = require("../services/chatbotService");
const { asyncHandler } = require("../middleware/errorHandler");

const ask = asyncHandler(async (req, res) => {
  const data = await chatbotService.ask(req.user, req.body.question);
  res.json({ success: true, data });
});

module.exports = { ask };
