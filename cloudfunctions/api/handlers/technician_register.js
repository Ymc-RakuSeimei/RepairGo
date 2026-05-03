const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { realName, phone, serviceArea, skills } = event;

  if (!realName || !phone || !skills || skills.length === 0) {
    return { code: -1, message: "请填写完整信息" };
  }

  try {
    // Check if already registered
    const existing = await db.collection("technicians").where({ _openid: openid }).get();
    if (existing.data.length > 0) {
      const tech = existing.data[0];
      if (tech.status === 'approved') {
        return { code: -1, message: "您已是认证维修工" };
      }
      if (tech.status === 'pending') {
        return { code: -1, message: "您的申请正在审核中" };
      }
      // If rejected, allow re-register by updating the record
      if (tech.status === 'rejected') {
        await db.collection("technicians").doc(tech._id).update({
          data: {
            realName, phone, skills,
            serviceArea: serviceArea || "",
            status: "pending",
            updatedAt: db.serverDate(),
          },
        });
        // Add to pendingRoles
        await addToPendingRoles(openid, 'technician');
        return { code: 0, message: "申请已重新提交" };
      }
      return { code: -1, message: "您已提交过注册申请" };
    }

    // Create technician record
    await db.collection("technicians").add({
      data: {
        _openid: openid,
        realName,
        phone,
        avatarUrl: "",
        skills,
        serviceArea: serviceArea || "",
        status: "pending",
        isOnline: false,
        isBusy: false,
        rating: 5.0,
        totalOrders: 0,
        totalIncome: 0,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    // Add 'technician' to pendingRoles (don't change role or roles)
    await addToPendingRoles(openid, 'technician');

    return { code: 0, message: "申请已提交" };
  } catch (err) {
    console.error("register error:", err);
    return { code: -1, message: "注册失败" };
  }
};

// Helper: add a role to user's pendingRoles
async function addToPendingRoles(openid, role) {
  const userRes = await db.collection("users").where({ _openid: openid }).get();
  if (userRes.data.length > 0) {
    const user = userRes.data[0];
    const pendingRoles = Array.isArray(user.pendingRoles) ? user.pendingRoles : [];
    if (!pendingRoles.includes(role)) {
      pendingRoles.push(role);
      await db.collection("users").doc(user._id).update({
        data: { pendingRoles, updatedAt: db.serverDate() },
      });
    }
  }
}
