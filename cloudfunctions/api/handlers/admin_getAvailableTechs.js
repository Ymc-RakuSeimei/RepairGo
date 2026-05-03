const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();
    
    const res = await db.collection("technicians")
      .where({ status: "approved", isOnline: true, isBusy: false })
      .orderBy("rating", "desc")
      .get();
    
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getAvailableTechs error:", err);
    return { code: -1, message: err.message || "获取空闲师傅失败" };
  }
};
