const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderId, rating, content } = event;

  if (!rating || rating < 1 || rating > 5) {
    return { code: -1, message: '请选择评分' };
  }
  if (!content || !content.trim()) {
    return { code: -1, message: '请填写评价内容' };
  }

  try {
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;

    if (order._openid !== openid) return { code: -1, message: '无权操作' };
    if (order.status !== 'completed') return { code: -1, message: '订单状态不可评价' };

    await db.collection('reviews').add({
      data: {
        orderId,
        _openid: openid,
        technicianId: order.technicianId,
        rating,
        content,
        createdAt: db.serverDate(),
      },
    });

    await db.collection('orders').doc(orderId).update({
      data: { status: 'reviewed', updatedAt: db.serverDate() },
    });

    // 更新师傅评分（取平均）
    const techId = order.technicianId;
    const reviewsRes = await db.collection('reviews').where({ technicianId: techId }).get();
    const reviews = reviewsRes.data;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await db.collection('technicians').doc(techId).update({
      data: {
        rating: Math.round(avgRating * 10) / 10,
        updatedAt: db.serverDate(),
      },
    });

    return { code: 0, message: '评价成功' };
  } catch (err) {
    console.error('submitReview error:', err);
    return { code: -1, message: '评价失败' };
  }
};
