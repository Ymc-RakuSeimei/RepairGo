const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const VALID_GENDERS = ['', 'male', 'female', 'unknown'];

function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone);
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const nickName = String(event.nickName || '').trim();
  const avatarUrl = String(event.avatarUrl || '').trim();
  const phone = String(event.phone || '').trim();
  const gender = String(event.gender || '').trim();

  if (!nickName) {
    return { code: -1, message: '请输入昵称' };
  }
  if (nickName.length > 20) {
    return { code: -1, message: '昵称不能超过20个字符' };
  }
  if (phone && !isValidPhone(phone)) {
    return { code: -1, message: '请输入正确的手机号' };
  }
  if (!VALID_GENDERS.includes(gender)) {
    return { code: -1, message: '性别参数无效' };
  }

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    if (!userRes.data.length) {
      return { code: -1, message: '用户不存在' };
    }

    const user = userRes.data[0];
    const updateData = {
      nickName,
      avatarUrl,
      phone,
      gender,
      updatedAt: db.serverDate(),
    };

    await db.collection('users').doc(user._id).update({ data: updateData });

    return {
      code: 0,
      data: {
        ...user,
        ...updateData,
      },
    };
  } catch (err) {
    console.error('updateProfile error:', err);
    return { code: -1, message: '更新资料失败' };
  }
};
