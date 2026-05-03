const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireTechnician, getTechnicianRecord, validatePrice } = require("./auth_helper");

exports.main = async (event, context) => {
  const { orderId, orderAction, repairNotes, price } = event;

  try {
    await requireTechnician();
    
    const orderRes = await db.collection("orders").doc(orderId).get();
    const order = orderRes.data;

    const tech = await getTechnicianRecord();
    
    if (tech._id !== order.technicianId) {
      return { code: -1, message: "无权操作此订单" };
    }

    if (orderAction === "start" && order.status === "accepted") {
      await db.collection("orders").doc(orderId).update({
        data: { status: "in_progress", updatedAt: db.serverDate() },
      });
      return { code: 0, message: "已开始维修" };
    }

    if (orderAction === "complete" && order.status === "in_progress") {
      // Validate price before completing
      const finalPrice = price || 0;
      validatePrice(finalPrice, 0, 10000);
      
      await db.collection("orders").doc(orderId).update({
        data: {
          status: "completed",
          repairNotes: repairNotes || "",
          price: finalPrice,
          completedAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      });

      await db.collection("technicians").doc(tech._id).update({
        data: {
          isBusy: false,
          totalOrders: db.command.inc(1),
          totalIncome: db.command.inc(finalPrice),
          updatedAt: db.serverDate(),
        },
      });

      await db.collection("income").add({
        data: {
          technicianId: tech._id,
          orderId,
          orderNo: order.orderNo,
          amount: finalPrice,
          type: "repair_fee",
          status: "pending",
          createdAt: db.serverDate(),
        },
      });

      return { code: 0, message: "维修完成" };
    }

    return { code: -1, message: "状态操作无效" };
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return { code: -1, message: err.message || "操作失败" };
  }
};
