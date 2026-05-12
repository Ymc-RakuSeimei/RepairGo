const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const {
  COLLECTION_NAME,
  ensureDefaultAddress,
  migrateLegacyDefaultAddress,
} = require('../helpers/userAddress');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    await migrateLegacyDefaultAddress(db, openid);
    const addresses = await ensureDefaultAddress(db, openid);

    return { code: 0, data: addresses };
  } catch (err) {
    console.error('getAddresses error:', err);
    return { code: -1, message: '获取地址失败' };
  }
};
