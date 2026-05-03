const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingRes, activeRes, techRes, todayRes] = await Promise.all([
      db.collection("orders").where({ status: "pending" }).count(),
      db.collection("orders").where({ status: _.in(["accepted", "in_progress"]) }).count(),
      db.collection("technicians").where({ status: "approved", isOnline: true }).count(),
      db.collection("orders").where({ status: _.in(["completed", "reviewed"]), completedAt: _.gte(today) }).count(),
    ]);

    return {
      code: 0,
      data: {
        pendingOrders: pendingRes.total,
        activeOrders: activeRes.total,
        onlineTechs: techRes.total,
        todayCompleted: todayRes.total,
      },
    };
  } catch (err) {
    console.error("getStats error:", err);
    return { code: -1, message: err.message || "获取统计失败" };
  }
};
