const utilityRepository = require("../repositories/utilityRepository");
const roomRepository = require("../repositories/roomRepository");
const { httpError, paginate } = require("../utils/helpers");

function calc(payload) {
  const electric_old = Number(payload.electric_old) || 0;
  const electric_new = Number(payload.electric_new) || 0;
  const water_old = Number(payload.water_old) || 0;
  const water_new = Number(payload.water_new) || 0;
  const electric_rate = Number(payload.electric_rate) || 3500;
  const water_rate = Number(payload.water_rate) || 18000;
  if (electric_new < electric_old) throw httpError(400, "Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ.");
  if (water_new < water_old) throw httpError(400, "Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số cũ.");
  return {
    room_id: Number(payload.room_id),
    period: payload.period,
    electric_old,
    electric_new,
    electric_rate,
    electric_amount: (electric_new - electric_old) * electric_rate,
    water_old,
    water_new,
    water_rate,
    water_amount: (water_new - water_old) * water_rate,
  };
}

async function listUtilities(query) {
  const paging = paginate(query);
  const result = await utilityRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function upsertUtility(payload) {
  if (!payload.room_id || !payload.period) throw httpError(400, "Vui lòng chọn phòng và kỳ.");
  if (!(await roomRepository.findById(payload.room_id))) throw httpError(400, "Phòng không tồn tại.");
  return utilityRepository.upsert(calc(payload));
}

async function deleteUtility(id) {
  const deleted = await utilityRepository.remove(id);
  if (!deleted) throw httpError(404, "Không tìm thấy bản ghi điện nước.");
}

module.exports = { listUtilities, upsertUtility, deleteUtility };
