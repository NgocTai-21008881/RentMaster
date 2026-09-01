const roomRepository = require("../repositories/roomRepository");
const propertyRepository = require("../repositories/propertyRepository");
const serviceRepository = require("../repositories/serviceRepository");
const { httpError, paginate } = require("../utils/helpers");
const { fileUrl } = require("../middleware/upload");
const { logActivity } = require("./activityService");

const STATUSES = ["vacant", "occupied", "reserved", "maintenance"];

async function validate(payload, filename) {
  const property_id = Number(payload.property_id);
  const code = (payload.code || "").trim();
  const name = (payload.name || "").trim();
  const rent_price = Number(payload.rent_price);
  const area = Number(payload.area);
  const status = payload.status || "vacant";
  if (!property_id) throw httpError(400, "Vui lòng chọn bất động sản.");
  if (!(await propertyRepository.findById(property_id))) throw httpError(400, "Bất động sản không tồn tại.");
  if (!code || !name) throw httpError(400, "Mã phòng và tên phòng là bắt buộc.");
  if (Number.isNaN(rent_price) || rent_price < 0) throw httpError(400, "Giá thuê không hợp lệ.");
  if (Number.isNaN(area) || area <= 0) throw httpError(400, "Diện tích phải lớn hơn 0.");
  if (!STATUSES.includes(status)) throw httpError(400, "Trạng thái phòng không hợp lệ.");
  return {
    property_id,
    code,
    name,
    floor: payload.floor ? Number(payload.floor) : null,
    area,
    rent_price,
    deposit: Number(payload.deposit) || 0,
    max_occupants: Number(payload.max_occupants) || 2,
    amenities: payload.amenities || null,
    image_url: filename ? fileUrl(filename) : payload.image_url || null,
    status,
  };
}

async function listRooms(query) {
  const paging = paginate({ ...query, limit: query.limit || 20 });
  const result = await roomRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function getRoom(id) {
  const room = await roomRepository.findById(id);
  if (!room) throw httpError(404, "Không tìm thấy phòng.");
  room.services = await serviceRepository.roomServices(id);
  return room;
}

async function createRoom(actorId, payload, filename) {
  const room = await roomRepository.create(await validate(payload, filename));
  if (payload.service_ids) {
    const ids = String(payload.service_ids).split(",").map(Number).filter(Boolean);
    await serviceRepository.setRoomServices(room.id, ids);
  }
  await logActivity({ userId: actorId, action: "create", entity: "rooms", entityId: room.id, detail: room.code });
  return getRoom(room.id);
}

async function updateRoom(actorId, id, payload, filename) {
  await getRoom(id);
  await roomRepository.update(id, await validate(payload, filename));
  if (payload.service_ids !== undefined) {
    const ids = String(payload.service_ids || "")
      .split(",")
      .map(Number)
      .filter(Boolean);
    await serviceRepository.setRoomServices(id, ids);
  }
  await logActivity({ userId: actorId, action: "update", entity: "rooms", entityId: id });
  return getRoom(id);
}

async function deleteRoom(actorId, id) {
  const deleted = await roomRepository.remove(id);
  if (!deleted) throw httpError(404, "Không tìm thấy phòng.");
  await logActivity({ userId: actorId, action: "delete", entity: "rooms", entityId: id });
}

module.exports = { listRooms, getRoom, createRoom, updateRoom, deleteRoom };
