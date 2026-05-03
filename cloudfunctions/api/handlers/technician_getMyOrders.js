const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireTechnician, getTechnicianRecord } = require("./auth_helper");

exports.main = async (event, context) => {
  const { status } = event;

  try {
    await requireTechnician();
    
    const tech = await getTechnicianRecord();
    const techId = tech._id;

    let query = db.collection("orders").where({ technicianId: techId });
    if (status) query = query.where({ status });
    const res = await query.orderBy("createdAt", "desc").limit(50).get();
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getMyOrders error:", err);
    return { code: -1, message: err.message || "获取订单失败" };
  }
};
