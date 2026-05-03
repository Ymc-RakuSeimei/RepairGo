const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireTechnician, getCurrentUser } = require("./auth_helper");

exports.main = async (event, context) => {
  const { technicianId } = event;
  
  try {
    await requireTechnician();
    
    // Technicians can only view their own reviews
    const { openid } = await getCurrentUser();
    const techRes = await db.collection("technicians").where({ _openid: openid }).get();
    if (techRes.data.length === 0 || techRes.data[0]._id !== technicianId) {
      return { code: -1, message: "无权查看此评价" };
    }
    
    const res = await db.collection("reviews")
      .where({ technicianId })
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getReviews error:", err);
    return { code: -1, message: err.message || "获取评价失败" };
  }
};
