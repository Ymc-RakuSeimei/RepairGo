const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    const { openid, user } = await requireAdmin();

    const { feedbackId, content } = event;

    if (!feedbackId) {
      return { code: -1, message: "缺少反馈ID" };
    }
    if (!content || content.trim().length === 0) {
      return { code: -1, message: "回复内容不能为空" };
    }

    await db.collection("feedback").doc(feedbackId).update({
      data: {
        replies: db.command.push({
          adminId: openid,
          adminName: user ? user.nickName : "管理员",
          content: content.trim(),
          createdAt: db.serverDate(),
        }),
        status: "replied",
        updatedAt: db.serverDate(),
      },
    });
    
    return { code: 0, message: "回复成功" };
  } catch (err) {
    console.error("replyFeedback error:", err);
    return { code: -1, message: err.message || "回复失败" };
  }
};
