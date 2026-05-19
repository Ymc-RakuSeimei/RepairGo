const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { status, statuses, page = 1, pageSize = 10 } = event;

  try {
    const condition = { _openid: openid };
    if (Array.isArray(statuses) && statuses.length > 0) {
      condition.status = _.in(statuses);
    } else if (status) {
      condition.status = status;
    }

    const query = db.collection('orders').where(condition);
    const skip = (page - 1) * pageSize;
    const res = await query.orderBy('createdAt', 'desc').skip(skip).limit(pageSize).get();
    return { code: 0, data: res.data };
  } catch (err) {
    console.error('getMyOrders error:', err);
    return { code: -1, message: '获取订单失败' };
  }
};
