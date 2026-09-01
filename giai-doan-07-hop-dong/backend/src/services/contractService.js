const contractRepository = require("../repositories/contractRepository");
const roomRepository = require("../repositories/roomRepository");
const tenantRepository = require("../repositories/tenantRepository");
const { httpError, paginate } = require("../utils/helpers");
const { fileUrl } = require("../middleware/upload");
const { logActivity } = require("./activityService");
const { notifyUser, notifyStaff } = require("./notifyService");

function nextCode() {
  return `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function ymd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function validate(payload, filename) {
  const tenant_id = Number(payload.tenant_id);
  const room_id = Number(payload.room_id);
  if (!tenant_id || !(await tenantRepository.findById(tenant_id))) throw httpError(400, "Người thuê không hợp lệ.");
  if (!room_id || !(await roomRepository.findById(room_id))) throw httpError(400, "Phòng không hợp lệ.");
  if (!payload.start_date || !payload.end_date) throw httpError(400, "Vui lòng chọn ngày bắt đầu và kết thúc.");
  if (payload.end_date <= payload.start_date) throw httpError(400, "Ngày kết thúc phải sau ngày bắt đầu.");
  return {
    code: payload.code || nextCode(),
    tenant_id,
    room_id,
    start_date: payload.start_date,
    end_date: payload.end_date,
    rent_amount: Number(payload.rent_amount) || 0,
    deposit_amount: Number(payload.deposit_amount) || 0,
    payment_day: Number(payload.payment_day) || 5,
    terms: payload.terms || null,
    file_url: filename ? fileUrl(filename) : payload.file_url || null,
    status: payload.status || "pending",
  };
}

async function syncRoom(contract) {
  if (["active", "expiring"].includes(contract.status) || contract.computed_status === "active" || contract.computed_status === "expiring") {
    if (contract.status === "active" || contract.status === "expiring") {
      await roomRepository.setStatus(contract.room_id, "occupied");
      await tenantRepository.update(contract.tenant_id, {
        ...(await tenantRepository.findById(contract.tenant_id)),
        room_id: contract.room_id,
      });
    }
  }
  if (["expired", "terminated"].includes(contract.status)) {
    await roomRepository.setStatus(contract.room_id, "vacant");
  }
}

async function listContracts(query) {
  const paging = paginate(query);
  const result = await contractRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function getContract(id) {
  const item = await contractRepository.findById(id);
  if (!item) throw httpError(404, "Không tìm thấy hợp đồng.");
  return item;
}

async function createContract(actorId, payload, filename) {
  const item = await contractRepository.create(await validate(payload, filename));
  if (item.status === "active") await syncRoom(item);
  await logActivity({ userId: actorId, action: "create", entity: "contracts", entityId: item.id, detail: item.code });
  return item;
}

async function updateContract(actorId, id, payload, filename) {
  await getContract(id);
  const item = await contractRepository.update(id, await validate(payload, filename));
  await syncRoom(item);
  await logActivity({ userId: actorId, action: "update", entity: "contracts", entityId: id });
  return item;
}

async function activateContract(actorId, id) {
  const item = await contractRepository.setStatus(id, "active");
  await roomRepository.setStatus(item.room_id, "occupied");
  const tenant = await tenantRepository.findById(item.tenant_id);
  await tenantRepository.update(item.tenant_id, { ...tenant, room_id: item.room_id });
  await logActivity({ userId: actorId, action: "activate", entity: "contracts", entityId: id });
  return item;
}

async function terminateContract(actorId, id) {
  const item = await contractRepository.setStatus(id, "terminated");
  await roomRepository.setStatus(item.room_id, "vacant");
  await logActivity({ userId: actorId, action: "terminate", entity: "contracts", entityId: id });
  return item;
}

async function renewContract(actorId, id, endDate) {
  const current = await getContract(id);
  if (!endDate) throw httpError(400, "Vui lòng chọn ngày kết thúc mới.");
  const item = await contractRepository.update(id, { ...current, end_date: endDate, status: "active" });
  await roomRepository.setStatus(item.room_id, "occupied");
  await logActivity({ userId: actorId, action: "renew", entity: "contracts", entityId: id });
  return item;
}

async function applyForRoom(user, roomId) {
  if (user.role !== "tenant") throw httpError(403, "Chỉ người thuê mới gửi yêu cầu thuê phòng.");
  const tenant = await tenantRepository.findByUserId(user.id);
  if (!tenant) throw httpError(400, "Tài khoản chưa gắn hồ sơ người thuê.");
  const room = await roomRepository.findById(Number(roomId));
  if (!room) throw httpError(404, "Không tìm thấy phòng.");
  if (room.status === "occupied") throw httpError(400, "Phòng đang được thuê.");
  if (room.status === "maintenance") throw httpError(400, "Phòng đang bảo trì, chưa cho thuê.");

  const mine = await contractRepository.findPendingByTenantAndRoom(tenant.id, room.id);
  if (mine) return contractRepository.findById(mine.id);

  const open = await contractRepository.findOpenByRoom(room.id);
  if (open) throw httpError(400, "Phòng đã có người đặt hoặc đang thuê.");

  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 12);
  const item = await contractRepository.create({
    code: nextCode(),
    tenant_id: tenant.id,
    room_id: room.id,
    start_date: ymd(start),
    end_date: ymd(end),
    rent_amount: Number(room.rent_price) || 0,
    deposit_amount: Number(room.deposit) || 0,
    payment_day: 5,
    terms: "Yêu cầu thuê từ trang chủ / cổng người thuê. Hợp đồng chờ chủ nhà xác nhận.",
    status: "pending",
  });
  await roomRepository.setStatus(room.id, "reserved");
  await contractRepository.confirm(item.id, "tenant");
  await notifyStaff({
    title: "Yêu cầu thuê phòng mới",
    message: `${tenant.full_name} muốn thuê ${room.code} — ${room.name}`,
    type: "contract",
    link: "/dashboard/contracts",
  });
  await logActivity({ userId: user.id, action: "apply", entity: "contracts", entityId: item.id, detail: item.code });
  return contractRepository.findById(item.id);
}

async function confirmContract(user, id) {
  const item = await getContract(id);
  const who = user.role === "tenant" ? "tenant" : "owner";
  if (who === "tenant") {
    const tenant = await tenantRepository.findByUserId(user.id);
    if (!tenant || tenant.id !== item.tenant_id) throw httpError(403, "Bạn không thể xác nhận hợp đồng này.");
  }
  const updated = await contractRepository.confirm(id, who);
  if (updated.tenant_confirmed_at && updated.owner_confirmed_at && updated.status === "pending") {
    return activateContract(user.id, id);
  }
  return updated;
}

module.exports = {
  listContracts,
  getContract,
  createContract,
  updateContract,
  activateContract,
  terminateContract,
  renewContract,
  confirmContract,
  applyForRoom,
};
