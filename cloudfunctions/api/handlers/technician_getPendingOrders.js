const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireTechnician, getTechnicianRecord } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireTechnician();
    
    const res = await db.collection("orders")
      .where({ status: "pending" })
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getPendingOrders error:", err);
    return { code: -1, message: err.message || "获取订单失败" };
  }
};
