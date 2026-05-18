const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderId } = event;

  if (!orderId) {
    return { code: -1, message: '缺少订单ID' };
  }

  try {
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;

    if (order._openid !== openid) {
      return { code: -1, message: '无权操作此订单' };
    }
    if (order.status !== 'pending' && order.status !== 'accepted') {
      return { code: -1, message: '当前状态不可取消' };
    }

    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'cancelled',
        updatedAt: db.serverDate(),
      },
    });

    // 如果有师傅接单了，释放师傅
    if (order.technicianId) {
      await db.collection('technicians').doc(order.technicianId).update({
        data: { isBusy: false, updatedAt: db.serverDate() },
      });
    }

    return { code: 0, message: '已取消' };
  } catch (err) {
    console.error('cancelOrder error:', err);
    return { code: -1, message: '取消失败' };
  }
};
