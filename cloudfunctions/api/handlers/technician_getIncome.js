const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { requireTechnician, getTechnicianRecord } = require("./auth_helper");

exports.main = async (event, context) => {
  try {
    await requireTechnician();
    
    const tech = await getTechnicianRecord();
    const techId = tech._id;

    const res = await db.collection("income")
      .where({ technicianId: techId })
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    
    return { code: 0, data: res.data };
  } catch (err) {
    console.error("getIncome error:", err);
    return { code: -1, message: err.message || "获取收入失败" };
  }
};
