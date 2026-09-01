const maintenanceRepository = require("../repositories/maintenanceRepository");
const tenantRepository = require("../repositories/tenantRepository");
const { httpError, paginate } = require("../utils/helpers");
const { fileUrl } = require("../middleware/upload");
const { notifyStaff, notifyUser } = require("./notifyService");

async function listRequests(query) {
  const paging = paginate(query);
  const result = await maintenanceRepository.findAll({ ...query, ...paging });
  return { items: result.rows, total: result.total, page: paging.page, limit: paging.limit };
}

async function createRequest(user, payload, filename) {
  const tenant = await tenantRepository.findByUserId(user.id);
  if (!tenant) throw httpError(400, "Tài khoản chưa gắn hồ sơ người thuê.");
  if (!tenant.room_id) throw httpError(400, "Bạn chưa được gán phòng để gửi yêu cầu.");
  const title = (payload.title || "").trim();
  const content = (payload.content || "").trim();
  if (!title || !content) throw httpError(400, "Vui lòng nhập tiêu đề và nội dung.");
  const item = await maintenanceRepository.create({
    tenant_id: tenant.id,
    room_id: tenant.room_id,
    title,
    content,
    category: payload.category || "other",
    priority: payload.priority || "medium",
    image_url: filename ? fileUrl(filename) : null,
  });
  await notifyStaff({
    title: "Yêu cầu hỗ trợ mới",
    message: `${tenant.full_name}: ${title}`,
    type: "maintenance",
    link: "/dashboard/maintenance",
  });
  return item;
}

async function updateRequest(actor, id, payload) {
  const current = await maintenanceRepository.findById(id);
  if (!current) throw httpError(404, "Không tìm thấy yêu cầu.");
  const item = await maintenanceRepository.update(id, {
    status: payload.status || current.status,
    response: payload.response,
    responded_by: actor.id,
  });
  const tenant = await tenantRepository.findById(item.tenant_id);
  if (tenant?.user_id) {
    await notifyUser(tenant.user_id, {
      title: "Yêu cầu hỗ trợ được cập nhật",
      message: `Trạng thái: ${item.status}. ${item.response || ""}`,
      type: "maintenance",
      link: "/portal/requests",
    });
  }
  return item;
}

module.exports = { listRequests, createRequest, updateRequest };
