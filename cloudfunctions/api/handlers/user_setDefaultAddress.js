const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { addressId } = event;

    if (!addressId) {
      return { code: -1, message: '缺少地址ID' };
    }

    const addrRes = await db.collection('addresses').doc(addressId).get();
    if (addrRes.data._openid !== openid) {
      return { code: -1, message: '无权操作此地址' };
    }

    const defaults = await db.collection('addresses')
      .where({ _openid: openid, isDefault: true })
      .get();
    for (const addr of defaults.data) {
      await db.collection('addresses').doc(addr._id).update({
        data: { isDefault: false },
      });
    }

    await db.collection('addresses').doc(addressId).update({
      data: { isDefault: true, updatedAt: db.serverDate() },
    });

    return { code: 0, message: '已设为默认地址' };
  } catch (err) {
    console.error('setDefaultAddress error:', err);
    return { code: -1, message: '设置默认地址失败' };
  }
};
