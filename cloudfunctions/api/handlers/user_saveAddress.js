const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const {
  COLLECTION_NAME,
  isValidPhone,
  normalizeAddressPayload,
  clearDefaultFlagForUser,
  ensureDefaultAddress,
} = require('../helpers/userAddress');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const addressId = String(event.addressId || '').trim();
  const payload = normalizeAddressPayload(event);

  if (!payload.name) {
    return { code: -1, message: '请输入联系人' };
  }
  if (!payload.phone || !isValidPhone(payload.phone)) {
    return { code: -1, message: '请输入正确的手机号' };
  }
  if (!payload.province || !payload.city || !payload.district) {
    return { code: -1, message: '请选择所在地区' };
  }
  if (!payload.detail) {
    return { code: -1, message: '请输入详细地址' };
  }

  try {
    let targetId = addressId;
    let shouldSetDefault = payload.isDefault;

    if (addressId) {
      const addressRes = await db.collection(COLLECTION_NAME).where({
        _id: addressId,
        _openid: openid,
      }).get();
      const address = addressRes.data[0];
      if (!address || address._openid !== openid) {
        return { code: -1, message: '地址不存在' };
      }

      shouldSetDefault = payload.isDefault || !!address.isDefault;
      await db.collection(COLLECTION_NAME).doc(addressId).update({
        data: {
          name: payload.name,
          phone: payload.phone,
          tag: payload.tag,
          province: payload.province,
          city: payload.city,
          district: payload.district,
          detail: payload.detail,
          fullAddress: payload.fullAddress,
          isDefault: shouldSetDefault,
          updatedAt: db.serverDate(),
        },
      });
    } else {
      const existingRes = await db.collection(COLLECTION_NAME).where({ _openid: openid }).get();
      shouldSetDefault = payload.isDefault || existingRes.data.length === 0;

      const addRes = await db.collection(COLLECTION_NAME).add({
        data: {
          _openid: openid,
          name: payload.name,
          phone: payload.phone,
          tag: payload.tag,
          province: payload.province,
          city: payload.city,
          district: payload.district,
          detail: payload.detail,
          fullAddress: payload.fullAddress,
          isDefault: shouldSetDefault,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate(),
        },
      });
      targetId = addRes._id;
    }

    if (shouldSetDefault) {
      await clearDefaultFlagForUser(db, openid, targetId);
    }

    const addresses = await ensureDefaultAddress(db, openid);
    return { code: 0, data: addresses };
  } catch (err) {
    console.error('saveAddress error:', err);
    console.error('saveAddress payload:', { openid, addressId, payload });
    return { code: -1, message: '保存地址失败' };
  }
};
