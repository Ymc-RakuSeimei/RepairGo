const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();
    
    const { feedbackId } = event;
    
    await db.collection("feedback").doc(feedbackId).update({
      data: {
        status: "closed",
        updatedAt: db.serverDate(),
      },
    });
    
    return { code: 0, message: "已关闭反馈" };
  } catch (err) {
    console.error("closeFeedback error:", err);
    return { code: -1, message: err.message || "关闭反馈失败" };
  }
};
