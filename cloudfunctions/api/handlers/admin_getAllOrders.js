const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();
    
    const { status, statuses, page = 1, pageSize = 20 } = event;
    const skip = (page - 1) * pageSize;

    const condition = {};
    if (Array.isArray(statuses) && statuses.length > 0) {
      condition.status = _.in(statuses);
    } else if (status) {
      condition.status = status;
    }

    let query = db.collection("orders").where(condition).orderBy("createdAt", "desc");

    const countRes = await query.count();
    const listRes = await query.skip(skip).limit(pageSize).get();
    
    return {
      code: 0,
      data: {
        list: listRes.data,
        total: countRes.total,
        page,
        pageSize,
      },
    };
  } catch (err) {
    console.error("getAllOrders error:", err);
    return { code: -1, message: err.message || "获取订单失败" };
  }
};
