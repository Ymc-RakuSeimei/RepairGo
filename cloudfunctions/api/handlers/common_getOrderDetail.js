const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { getCurrentUser, requireAdmin } = require("./auth_helper");

exports.main = async (event, context) => {
  const { orderId } = event;
  
  try {
    const { openid, role } = await getCurrentUser();
    
    const res = await db.collection('orders').doc(orderId).get();
    const order = res.data;
    
    // Authorization check: users can only see their own orders, technicians only assigned orders
    if (role === 'user' && order._openid !== openid) {
      return { code: -1, message: '无权查看此订单' };
    }
    
    if (role === 'technician' && order.technicianId !== openid) {
      return { code: -1, message: '无权查看此订单' };
    }
    
    // Admin can view all orders
    
    return { code: 0, data: order };
  } catch (err) {
    console.error('getOrderDetail error:', err);
    return { code: -1, message: '获取订单详情失败' };
  }
};
