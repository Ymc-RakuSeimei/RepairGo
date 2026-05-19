const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const countRes = await db.collection('orders')
      .where({ _openid: openid })
      .count();

    const completedRes = await db.collection('orders')
      .where({
        _openid: openid,
        status: _.in(['completed', 'reviewed']),
      })
      .field({ actualPrice: true })
      .get();

    let totalSpent = 0;
    for (const order of completedRes.data) {
      totalSpent += Number(order.actualPrice) || 0;
    }

    return {
      code: 0,
      data: {
        totalOrders: countRes.total,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
    };
  } catch (err) {
    console.error('getStats error:', err);
    return { code: -1, message: '获取统计信息失败' };
  }
};
