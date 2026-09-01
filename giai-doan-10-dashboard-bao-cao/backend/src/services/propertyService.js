const propertyRepository = require("../repositories/propertyRepository");
const { httpError, paginate } = require("../utils/helpers");
const { fileUrl } = require("../middleware/upload");
const { logActivity } = require("./activityService");

const TYPES = ["apartment", "homestay", "boarding"];

function validate(payload, filename) {
  const name = (payload.name || "").trim();
  const type = payload.type;
  const address = (payload.address || "").trim();
  if (!name) throw httpError(400, "Tên bất động sản không được để trống.");
  if (!TYPES.includes(type)) throw httpError(400, "Loại BĐS không hợp lệ.");
  if (!address) throw httpError(400, "Địa chỉ không được để trống.");
  return {
    name,
    type,
    address,
    description: (payload.description || "").trim(),
    image_url: filename ? fileUrl(filename) : payload.image_url || null,
    manager_id: payload.manager_id || null,
    status: payload.status || "active",
  };
}

async function listProperties(query) {
  const paging = paginate(query);
  const result = await propertyRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function getProperty(id) {
  const item = await propertyRepository.findById(id);
  if (!item) throw httpError(404, "Không tìm thấy bất động sản.");
  return item;
}

async function createProperty(actorId, payload, filename) {
  const item = await propertyRepository.create(validate(payload, filename));
  await logActivity({ userId: actorId, action: "create", entity: "properties", entityId: item.id, detail: item.name });
  return item;
}

async function updateProperty(actorId, id, payload, filename) {
  await getProperty(id);
  const item = await propertyRepository.update(id, validate(payload, filename));
  await logActivity({ userId: actorId, action: "update", entity: "properties", entityId: id });
  return item;
}

async function deleteProperty(actorId, id) {
  const deleted = await propertyRepository.remove(id);
  if (!deleted) throw httpError(404, "Không tìm thấy bất động sản.");
  await logActivity({ userId: actorId, action: "delete", entity: "properties", entityId: id });
}

module.exports = { listProperties, getProperty, createProperty, updateProperty, deleteProperty };
