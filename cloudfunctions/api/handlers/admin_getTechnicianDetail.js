const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();
    
    const { technicianId } = event;
    
    const res = await db.collection("technicians").doc(technicianId).get();
    
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getTechnicianDetail error:", err);
    return { code: -1, message: err.message || "获取师傅详情失败" };
  }
};
