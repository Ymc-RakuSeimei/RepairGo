const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();

    const incomeRes = await db.collection("income")
      .where({ status: "pending" })
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const list = await Promise.all((incomeRes.data || []).map(async (item) => {
      const [orderRes, techRes] = await Promise.all([
        item.orderId ? db.collection("orders").doc(item.orderId).get().catch(() => ({ data: null })) : Promise.resolve({ data: null }),
        item.technicianId ? db.collection("technicians").doc(item.technicianId).get().catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);
      const order = orderRes.data || {};
      const technician = techRes.data || {};

      return {
        ...item,
        technicianName: item.technicianName || technician.realName || "",
        orderNo: item.orderNo || order.orderNo || "",
        paidAt: order.paidAt || null,
        settlementStatus: order.settlementStatus || "unsettled",
      };
    }));

    return { code: 0, data: list };
  } catch (err) {
    console.error("getPendingSettlements error:", err);
    return { code: -1, message: err.message || "获取待结算记录失败" };
  }
};
