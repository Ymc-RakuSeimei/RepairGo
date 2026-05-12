const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const {
  COLLECTION_NAME,
  clearDefaultFlagForUser,
  ensureDefaultAddress,
} = require('../helpers/userAddress');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const addressId = String(event.addressId || '').trim();

  if (!addressId) {
    return { code: -1, message: '缺少地址ID' };
  }

  try {
    const addressRes = await db.collection(COLLECTION_NAME).doc(addressId).get();
    const address = addressRes.data;
    if (!address || address._openid !== openid) {
      return { code: -1, message: '地址不存在' };
    }

    await clearDefaultFlagForUser(db, openid, addressId);
    await db.collection(COLLECTION_NAME).doc(addressId).update({
      data: {
        isDefault: true,
        updatedAt: db.serverDate(),
      },
    });

    const addresses = await ensureDefaultAddress(db, openid);
    return { code: 0, data: addresses };
  } catch (err) {
    console.error('setDefaultAddress error:', err);
    return { code: -1, message: '设置默认地址失败' };
  }
};
