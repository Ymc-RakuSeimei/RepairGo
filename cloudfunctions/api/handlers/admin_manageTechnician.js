const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();

    const { technicianId, manageAction: action } = event;

    const techRes = await db.collection("technicians").doc(technicianId).get();
    const tech = techRes.data;
    const techOpenid = tech._openid;

    if (action === 'approve') {
      // Update technician status
      await db.collection("technicians").doc(technicianId).update({
        data: { status: "approved", updatedAt: db.serverDate() },
      });
      // Add 'technician' to user's roles, remove from pendingRoles
      await updateUserRoles(techOpenid, 'technician', 'add');
      return { code: 0, message: "审核通过" };
    }

    if (action === 'reject') {
      await db.collection("technicians").doc(technicianId).update({
        data: { status: "rejected", updatedAt: db.serverDate() },
      });
      // Remove 'technician' from pendingRoles
      await updateUserRoles(techOpenid, 'technician', 'removePending');
      return { code: 0, message: "已拒绝" };
    }

    if (action === 'disable') {
      await db.collection("technicians").doc(technicianId).update({
        data: { status: "disabled", isOnline: false, isBusy: false, updatedAt: db.serverDate() },
      });
      // Remove 'technician' from roles
      await updateUserRoles(techOpenid, 'technician', 'remove');
      return { code: 0, message: "已禁用" };
    }

    return { code: -1, message: "无效操作" };
  } catch (err) {
    console.error("manageTechnician error:", err);
    return { code: -1, message: err.message || "操作失败" };
  }
};

/**
 * Update a user's roles/pendingRoles arrays
 * @param {string} openid - user openid
 * @param {string} role - role to modify
 * @param {string} action - 'add' (to roles), 'remove' (from roles), 'removePending' (from pendingRoles)
 */
async function updateUserRoles(openid, role, action) {
  const userRes = await db.collection("users").where({ _openid: openid }).get();
  if (userRes.data.length === 0) return;

  const user = userRes.data[0];
  let roles = Array.isArray(user.roles) ? [...user.roles] : [user.role || 'user'];
  let pendingRoles = Array.isArray(user.pendingRoles) ? [...user.pendingRoles] : [];

  if (action === 'add') {
    if (!roles.includes(role)) roles.push(role);
    pendingRoles = pendingRoles.filter(r => r !== role);
  } else if (action === 'remove') {
    roles = roles.filter(r => r !== role);
  } else if (action === 'removePending') {
    pendingRoles = pendingRoles.filter(r => r !== role);
  }

  await db.collection("users").doc(user._id).update({
    data: { roles, pendingRoles, updatedAt: db.serverDate() },
  });
}
