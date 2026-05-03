const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { reason } = event;

  try {
    const userRes = await db.collection("users").where({ _openid: openid }).get();
    if (userRes.data.length === 0) {
      return { code: -1, message: "用户不存在" };
    }

    const user = userRes.data[0];
    const roles = Array.isArray(user.roles) ? user.roles : [user.role || 'user'];
    const pendingRoles = Array.isArray(user.pendingRoles) ? user.pendingRoles : [];

    // Already admin
    if (roles.includes('admin')) {
      return { code: -1, message: "您已是管理员" };
    }

    // Already applied
    if (pendingRoles.includes('admin')) {
      return { code: -1, message: "您的申请正在审核中" };
    }

    // Add 'admin' to pendingRoles
    pendingRoles.push('admin');
    await db.collection("users").doc(user._id).update({
      data: { pendingRoles, updatedAt: db.serverDate() },
    });

    return { code: 0, message: "申请已提交，请等待开发者审核" };
  } catch (err) {
    console.error("applyAdmin error:", err);
    return { code: -1, message: "申请失败" };
  }
};
