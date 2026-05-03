const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { action } = event;

  try {
    const currentUserRes = await db.collection("users").where({ _openid: openid }).get();
    
    // First user setup — set as developer
    if (currentUserRes.data.length === 0) {
      await db.collection("users").add({
        data: {
          _openid: openid,
          role: 'developer',
          roles: ['developer'],
          pendingRoles: [],
          nickName: '开发者',
          avatarUrl: "",
          phone: "",
          address: "",
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      });
      return { code: 0, message: "已设置为开发者" };
    }

    return { code: -1, message: "用户已存在，无法重复设置" };
  } catch (err) {
    console.error("setup error:", err);
    return { code: -1, message: "操作失败" };
  }
};
