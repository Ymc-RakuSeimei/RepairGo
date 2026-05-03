const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireRole } = require("./auth_helper");

exports.main = async (event, context) => {
  const { action, userId } = event;

  try {
    // Only developer can review admin applications
    await requireRole('developer');

    // List all pending admin applications
    if (action === 'list') {
      const res = await db.collection("users")
        .where({ pendingRoles: db.command.in(['admin']) })
        .orderBy('updatedAt', 'desc')
        .get();
      return { code: 0, data: res.data };
    }

    // Approve admin application
    if (action === 'approve' && userId) {
      const userRes = await db.collection("users").doc(userId).get();
      const user = userRes.data;
      let roles = Array.isArray(user.roles) ? [...user.roles] : [user.role || 'user'];
      let pendingRoles = Array.isArray(user.pendingRoles) ? [...user.pendingRoles] : [];

      if (!roles.includes('admin')) roles.push('admin');
      pendingRoles = pendingRoles.filter(r => r !== 'admin');

      await db.collection("users").doc(userId).update({
        data: { roles, pendingRoles, updatedAt: db.serverDate() },
      });
      return { code: 0, message: "已通过" };
    }

    // Reject admin application
    if (action === 'reject' && userId) {
      const userRes = await db.collection("users").doc(userId).get();
      const user = userRes.data;
      let pendingRoles = Array.isArray(user.pendingRoles) ? [...user.pendingRoles] : [];
      pendingRoles = pendingRoles.filter(r => r !== 'admin');

      await db.collection("users").doc(userId).update({
        data: { pendingRoles, updatedAt: db.serverDate() },
      });
      return { code: 0, message: "已拒绝" };
    }

    return { code: -1, message: "无效操作" };
  } catch (err) {
    console.error("reviewApplications error:", err);
    return { code: -1, message: err.message || "操作失败" };
  }
};
