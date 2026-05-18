const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();

    const { orderId, technicianId } = event;

    if (!orderId || !technicianId) {
      return { code: -1, message: "缺少订单ID或维修师傅ID" };
    }

    const orderRes = await db.collection("orders").doc(orderId).get();
    if (orderRes.data.status !== "pending") return { code: -1, message: "该订单已被处理" };

    const techRes = await db.collection("technicians").doc(technicianId).get();
    const tech = techRes.data;
    if (tech.status !== "approved") return { code: -1, message: "该师傅未通过审核" };
    if (tech.isBusy) return { code: -1, message: "该师傅正忙" };

    await db.collection("orders").doc(orderId).update({
      data: {
        technicianId: tech._id,
        technicianName: tech.realName,
        dispatchedBy: "admin",
        status: "accepted",
        acceptedAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    await db.collection("technicians").doc(technicianId).update({
      data: { isBusy: true, updatedAt: db.serverDate() },
    });

    return { code: 0, message: "派单成功" };
  } catch (err) {
    console.error("dispatchOrder error:", err);
    return { code: -1, message: err.message || "派单失败" };
  }
};
