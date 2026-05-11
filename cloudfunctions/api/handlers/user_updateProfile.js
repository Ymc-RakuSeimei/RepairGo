const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const updateData = {};

    if (event.nickName !== undefined) {
      const nickName = String(event.nickName).trim();
      if (nickName.length === 0) {
        return { code: -1, message: '昵称不能为空' };
      }
      if (nickName.length > 20) {
        return { code: -1, message: '昵称不能超过20个字' };
      }
      updateData.nickName = nickName;
    }

    if (event.avatarUrl !== undefined) {
      updateData.avatarUrl = String(event.avatarUrl);
    }

    if (event.gender !== undefined) {
      const gender = Number(event.gender);
      if (![0, 1, 2].includes(gender)) {
        return { code: -1, message: '性别值无效' };
      }
      updateData.gender = gender;
    }

    if (Object.keys(updateData).length === 0) {
      return { code: -1, message: '没有需要更新的内容' };
    }

    updateData.updatedAt = db.serverDate();

    await db.collection('users').where({ _openid: openid }).update({
      data: updateData,
    });

    const userRes = await db.collection('users').where({ _openid: openid }).get();
    return { code: 0, data: userRes.data[0] };
  } catch (err) {
    console.error('updateProfile error:', err);
    return { code: -1, message: '更新资料失败' };
  }
};
