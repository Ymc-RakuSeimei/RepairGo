const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireTechnician, getCurrentUser } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    const { openid } = await requireTechnician();
    
    const res = await db.collection("technicians").where({ _openid: openid }).get();
    if (res.data.length === 0) return { code: 0, data: null };
    return { code: 0, data: res.data[0] };
  } catch (err) {
    console.error("getProfile error:", err);
    return { code: -1, message: err.message || "获取信息失败" };
  }
};
