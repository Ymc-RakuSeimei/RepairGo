const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();
    
    const { feedbackId } = event;
    
    const res = await db.collection("feedback").doc(feedbackId).get();
    
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getFeedbackDetail error:", err);
    return { code: -1, message: err.message || "获取反馈详情失败" };
  }
};
