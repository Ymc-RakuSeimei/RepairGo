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
    const addr = addrRes.data;
    if (addr._openid !== openid) {
      return { code: -1, message: '无权删除此地址' };
    }

    const wasDefault = addr.isDefault;

    await db.collection('addresses').doc(addressId).remove();

    if (wasDefault) {
      const remaining = await db.collection('addresses')
        .where({ _openid: openid })
        .orderBy('updatedAt', 'desc')
        .limit(1)
        .get();

      if (remaining.data.length > 0) {
        await db.collection('addresses').doc(remaining.data[0]._id).update({
          data: { isDefault: true },
        });
      }
    }

    return { code: 0, message: '地址已删除' };
  } catch (err) {
    console.error('deleteAddress error:', err);
    return { code: -1, message: '删除地址失败' };
  }
};
