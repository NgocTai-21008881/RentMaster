const tenantRepository = require("../repositories/tenantRepository");
const roomRepository = require("../repositories/roomRepository");
const contractRepository = require("../repositories/contractRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const { httpError, paginate } = require("../utils/helpers");
const { logActivity } = require("./activityService");

async function validate(payload) {
  const full_name = (payload.full_name || "").trim();
  const phone = (payload.phone || "").trim();
  if (!full_name) throw httpError(400, "Họ tên không được để trống.");
  if (!phone) throw httpError(400, "Số điện thoại không được để trống.");
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw httpError(400, "Email không hợp lệ.");
  }
  if (payload.room_id && !(await roomRepository.findById(payload.room_id))) {
    throw httpError(400, "Phòng không tồn tại.");
  }
  return {
    user_id: payload.user_id || null,
    full_name,
    date_of_birth: payload.date_of_birth || null,
    gender: payload.gender || null,
    id_number: payload.id_number || null,
    phone,
    email: payload.email || null,
    permanent_address: payload.permanent_address || null,
    emergency_contact: payload.emergency_contact || null,
    emergency_phone: payload.emergency_phone || null,
    notes: payload.notes || null,
    room_id: payload.room_id || null,
  };
}

async function listTenants(query) {
  const paging = paginate(query);
  const result = await tenantRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function getTenant(id) {
  const tenant = await tenantRepository.findById(id);
  if (!tenant) throw httpError(404, "Không tìm thấy người thuê.");
  const contracts = await contractRepository.findAll({ tenant_id: id, limit: 20, offset: 0 });
  const invoices = await invoiceRepository.findAll({ tenant_id: id, limit: 20, offset: 0 });
  return { ...tenant, contracts: contracts.rows, invoices: invoices.rows };
}

async function createTenant(actorId, payload) {
  const tenant = await tenantRepository.create(await validate(payload));
  await logActivity({ userId: actorId, action: "create", entity: "tenants", entityId: tenant.id, detail: tenant.full_name });
  return tenant;
}

async function updateTenant(actorId, id, payload) {
  await tenantRepository.findById(id);
  const tenant = await tenantRepository.update(id, await validate(payload));
  await logActivity({ userId: actorId, action: "update", entity: "tenants", entityId: id });
  return tenant;
}

async function deleteTenant(actorId, id) {
  const deleted = await tenantRepository.remove(id);
  if (!deleted) throw httpError(404, "Không tìm thấy người thuê.");
  await logActivity({ userId: actorId, action: "delete", entity: "tenants", entityId: id });
}

module.exports = { listTenants, getTenant, createTenant, updateTenant, deleteTenant };
