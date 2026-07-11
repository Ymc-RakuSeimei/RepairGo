const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    if (!event.code) {
      return { code: -1, message: '缺少手机号授权码' };
    }

    const phoneRes = await cloud.openapi.security.getPhoneNumber({
      code: event.code,
    });

    const phoneNumber = phoneRes.phone_info.phoneNumber;
    const { nickName, avatarUrl } = event;

    const userRes = await db.collection('users').where({ _openid: openid }).get();
    const profileData = {};
    if (nickName) profileData.nickName = nickName;
    if (avatarUrl) profileData.avatarUrl = avatarUrl;

    if (userRes.data.length > 0) {
      await db.collection('users').doc(userRes.data[0]._id).update({
        data: { phone: phoneNumber, ...profileData, updatedAt: db.serverDate() },
      });
    } else {
      await db.collection('users').add({
        data: {
          _openid: openid,
          roles: ['user'],
          pendingRoles: [],
          nickName: nickName || '',
          avatarUrl: avatarUrl || '',
          phone: phoneNumber,
          address: '',
          gender: 0,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      });
    }

    return {
      code: 0,
      data: {
        phone: phoneNumber,
        nickName: nickName || '',
        avatarUrl: avatarUrl || '',
      },
    };
  } catch (err) {
    console.error('bindPhone error:', err);
    return { code: -1, message: '手机号绑定失败' };
  }
};
