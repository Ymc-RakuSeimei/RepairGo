const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { status, page = 1, pageSize = 10 } = event;

  try {
    let query = db.collection('orders').where({ _openid: openid });
    if (status) {
      query = query.where({ status });
    }
    const skip = (page - 1) * pageSize;
    const res = await query.orderBy('createdAt', 'desc').skip(skip).limit(pageSize).get();
    return { code: 0, data: res.data };
  } catch (err) {
    console.error('getMyOrders error:', err);
    return { code: -1, message: '获取订单失败' };
  }
};
