const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin, getCurrentUser } = require("./auth_helper");

exports.main = async (event, context) => {
  const { incomeId } = event;

  if (!incomeId) {
    return { code: -1, message: "缺少结算记录ID" };
  }

  try {
    await requireAdmin();
    const { user } = await getCurrentUser();

    const incomeRes = await db.collection("income").doc(incomeId).get();
    const income = incomeRes.data;
    if (!income) {
      return { code: -1, message: "结算记录不存在" };
    }
    if (income.status !== "pending") {
      return { code: -1, message: "该记录已结算" };
    }

    await db.collection("income").doc(incomeId).update({
      data: {
        status: "settled",
        settledAt: db.serverDate(),
        settledBy: user && user._id ? user._id : "",
      },
    });

    if (income.technicianId) {
      await db.collection("technicians").doc(income.technicianId).update({
        data: {
          totalIncome: db.command.inc(Number(income.amount) || 0),
          updatedAt: db.serverDate(),
        },
      });
    }

    if (income.orderId) {
      await db.collection("orders").doc(income.orderId).update({
        data: {
          settlementStatus: "settled",
          updatedAt: db.serverDate(),
        },
      });
    }

    return { code: 0, message: "结算成功" };
  } catch (err) {
    console.error("settleIncome error:", err);
    return { code: -1, message: err.message || "结算失败" };
  }
};
