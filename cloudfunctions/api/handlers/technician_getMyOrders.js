const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { requireTechnician, getTechnicianRecord } = require("./auth_helper");

exports.main = async (event, context) => {
  const { status, statuses } = event;

  try {
    await requireTechnician();
    
    const tech = await getTechnicianRecord();
    const techId = tech._id;

    const condition = { technicianId: techId };
    if (Array.isArray(statuses) && statuses.length > 0) {
      condition.status = _.in(statuses);
    } else if (status) {
      condition.status = status;
    }

    const query = db.collection("orders").where(condition);
    const res = await query.orderBy("createdAt", "desc").limit(50).get();
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getMyOrders error:", err);
    return { code: -1, message: err.message || "获取订单失败" };
  }
};
