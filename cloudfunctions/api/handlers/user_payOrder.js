const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function generatePaymentOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `PAY${y}${m}${d}${h}${min}${s}${rand}`;
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderId } = event;

  if (!orderId) {
    return { code: -1, message: "缺少订单ID" };
  }

  try {
    const orderRes = await db.collection("orders").doc(orderId).get();
    const order = orderRes.data;

    if (!order) {
      return { code: -1, message: "订单不存在" };
    }
    if (order._openid !== openid) {
      return { code: -1, message: "无权操作此订单" };
    }
    if (order.paymentStatus === "paid") {
      return { code: 0, message: "订单已支付" };
    }
    if (order.status !== "awaiting_payment") {
      return { code: -1, message: "当前订单不可支付" };
    }

    const existingIncome = await db.collection("income")
      .where({ orderId })
      .limit(1)
      .get();
    const paymentOrderNo = generatePaymentOrderNo();

    await db.collection("orders").doc(orderId).update({
      data: {
        status: "completed",
        paymentStatus: "paid",
        paymentAmount: Number(order.price) || 0,
        paymentMethod: "mock_wechat_pay",
        paymentOrderNo,
        paymentRemark: "模拟支付成功",
        paidAt: db.serverDate(),
        completedAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    if (!existingIncome.data.length) {
      await db.collection("income").add({
        data: {
          technicianId: order.technicianId,
          technicianName: order.technicianName || "",
          orderId,
          orderNo: order.orderNo,
          amount: Number(order.price) || 0,
          type: "repair_fee",
          status: "pending",
          createdAt: db.serverDate(),
        },
      });
    }

    return {
      code: 0,
      message: "支付成功",
      data: {
        paymentOrderNo,
      },
    };
  } catch (err) {
    console.error("payOrder error:", err);
    return { code: -1, message: "支付失败" };
  }
};
