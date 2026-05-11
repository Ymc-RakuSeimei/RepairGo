const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { name, phone, province, city, district, detail, isDefault, tag } = event;

    if (!name || !String(name).trim()) {
      return { code: -1, message: '请填写联系人姓名' };
    }
    if (!phone || !String(phone).trim()) {
      return { code: -1, message: '请填写联系电话' };
    }
    if (!province || !city || !district) {
      return { code: -1, message: '请选择省市区' };
    }
    if (!detail || !String(detail).trim()) {
      return { code: -1, message: '请填写详细地址' };
    }

    const nameStr = String(name).trim().slice(0, 20);
    const phoneStr = String(phone).trim();
    const detailStr = String(detail).trim().slice(0, 100);
    const tagStr = tag ? String(tag).trim().slice(0, 5) : '';
    const fullAddress = province + city + district + detailStr;

    const existing = await db.collection('addresses')
      .where({ _openid: openid })
      .count();

    const shouldBeDefault = isDefault || existing.total === 0;

    if (shouldBeDefault) {
      const defaults = await db.collection('addresses')
        .where({ _openid: openid, isDefault: true })
        .get();
      for (const addr of defaults.data) {
        await db.collection('addresses').doc(addr._id).update({
          data: { isDefault: false },
        });
      }
    }

    const newAddress = {
      _openid: openid,
      name: nameStr,
      phone: phoneStr,
      province,
      city,
      district,
      detail: detailStr,
      fullAddress,
      tag: tagStr,
      isDefault: shouldBeDefault,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    const addRes = await db.collection('addresses').add({ data: newAddress });
    return { code: 0, data: { _id: addRes._id, ...newAddress } };
  } catch (err) {
    console.error('addAddress error:', err);
    return { code: -1, message: '添加地址失败' };
  }
};
