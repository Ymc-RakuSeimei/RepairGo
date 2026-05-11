const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const res = await db.collection('addresses')
      .where({ _openid: openid })
      .orderBy('isDefault', 'desc')
      .orderBy('updatedAt', 'desc')
      .get();

    return { code: 0, data: res.data };
  } catch (err) {
    console.error('getAddresses error:', err);
    return { code: -1, message: '获取地址列表失败' };
  }
};
