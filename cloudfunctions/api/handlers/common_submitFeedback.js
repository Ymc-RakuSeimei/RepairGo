const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { type, title, content, images, submitterRole, orderId } = event;

  if (!type || !title || !content) {
    return { code: -1, message: '请填写完整信息' };
  }

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    const submitterName = userRes.data.length > 0 ? userRes.data[0].nickName : '匿名用户';

    const feedback = {
      _openid: openid,
      submitterRole: submitterRole || 'user',
      submitterName,
      orderId: orderId || '',
      type,
      title,
      content,
      images: images || [],
      status: 'open',
      replies: [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    const res = await db.collection('feedback').add({ data: feedback });
    return { code: 0, data: { _id: res._id } };
  } catch (err) {
    console.error('submitFeedback error:', err);
    return { code: -1, message: '提交反馈失败' };
  }
};
