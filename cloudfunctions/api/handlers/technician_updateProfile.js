const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const updateData = {};

    if (event.avatarUrl !== undefined) {
      updateData.avatarUrl = String(event.avatarUrl);
    }

    if (Object.keys(updateData).length === 0) {
      return { code: -1, message: '没有需要更新的内容' };
    }

    updateData.updatedAt = db.serverDate();

    await db.collection('technicians').where({ _openid: openid }).update({
      data: updateData,
    });

    const res = await db.collection('technicians').where({ _openid: openid }).get();
    return { code: 0, data: res.data[0] };
  } catch (err) {
    console.error('technician updateProfile error:', err);
    return { code: -1, message: '更新资料失败' };
  }
};
