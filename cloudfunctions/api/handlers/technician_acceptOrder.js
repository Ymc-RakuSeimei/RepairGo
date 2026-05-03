const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireTechnician, getTechnicianRecord } = require("./auth_helper");

exports.main = async (event, context) => {
  const { orderId } = event;

  try {
    await requireTechnician();
    
    const tech = await getTechnicianRecord();
    
    if (tech.status !== "approved") return { code: -1, message: "账号未审核通过" };
    if (tech.isBusy) return { code: -1, message: "您当前有进行中的订单" };

    const orderRes = await db.collection("orders").doc(orderId).get();
    if (orderRes.data.status !== "pending") return { code: -1, message: "该订单已被接单" };

    await db.collection("orders").doc(orderId).update({
      data: {
        technicianId: tech._id,
        technicianName: tech.realName,
        dispatchedBy: "self",
        status: "accepted",
        acceptedAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    await db.collection("technicians").doc(tech._id).update({
      data: { isBusy: true, updatedAt: db.serverDate() },
    });

    return { code: 0, message: "接单成功" };
  } catch (err) {
    console.error("acceptOrder error:", err);
    return { code: -1, message: err.message || "接单失败" };
  }
};
