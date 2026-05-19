const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { getCurrentUser, hasPermission } = require("./auth_helper");

exports.main = async (event, context) => {
  const { orderId } = event;

  if (!orderId) {
    return { code: -1, message: '缺少订单ID' };
  }

  try {
    const { openid, user } = await getCurrentUser();

    const res = await db.collection('orders').doc(orderId).get();
    const order = res.data;

    // 用户只能查看自己的订单
    if (!hasPermission(user.roles, 'admin') && order._openid !== openid) {
      // 如果不是管理员，检查是否是分配给该维修师傅的订单
      if (hasPermission(user.roles, 'technician')) {
        const techRes = await db.collection('technicians').where({ _openid: openid }).get();
        if (techRes.data.length === 0 || techRes.data[0]._id !== order.technicianId) {
          return { code: -1, message: '无权查看此订单' };
        }
      } else {
        return { code: -1, message: '无权查看此订单' };
      }
    }

    return {
      code: 0,
      data: {
        ...order,
        paymentStatus: order.paymentStatus || 'unpaid',
        paymentAmount: Number(order.paymentAmount || order.price || 0),
        paymentMethod: order.paymentMethod || '',
        paymentOrderNo: order.paymentOrderNo || '',
        paymentRemark: order.paymentRemark || '',
        paidAt: order.paidAt || null,
        serviceFinishedAt: order.serviceFinishedAt || null,
        settlementStatus: order.settlementStatus || 'unsettled',
      },
    };
  } catch (err) {
    console.error('getOrderDetail error:', err);
    return { code: -1, message: '获取订单详情失败' };
  }
};
