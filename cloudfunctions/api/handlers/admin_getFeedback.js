const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireAdmin();
    
    const { status, page = 1, pageSize = 20 } = event;
    const skip = (page - 1) * pageSize;
    
    let query = db.collection("feedback").orderBy("createdAt", "desc");
    if (status) {
      query = query.where({ status });
    }
    
    const [countRes, listRes] = await Promise.all([
      query.count(),
      query.skip(skip).limit(pageSize).get(),
    ]);
    
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
    console.error("getFeedback error:", err);
    return { code: -1, message: err.message || "获取反馈失败" };
  }
};
