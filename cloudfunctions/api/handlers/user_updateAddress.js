const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { addressId, name, phone, province, city, district, detail, isDefault, tag } = event;

    if (!addressId) {
      return { code: -1, message: '缺少地址ID' };
    }

    const addrRes = await db.collection('addresses').doc(addressId).get();
    const addr = addrRes.data;
    if (addr._openid !== openid) {
      return { code: -1, message: '无权修改此地址' };
    }

    const updateData = {};

    if (name !== undefined) {
      const nameStr = String(name).trim();
      if (!nameStr) return { code: -1, message: '联系人姓名不能为空' };
      updateData.name = nameStr.slice(0, 20);
    }
    if (phone !== undefined) {
      const phoneStr = String(phone).trim();
      if (!phoneStr) return { code: -1, message: '联系电话不能为空' };
      updateData.phone = phoneStr;
    }
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;
    if (detail !== undefined) {
      const detailStr = String(detail).trim();
      if (!detailStr) return { code: -1, message: '详细地址不能为空' };
      updateData.detail = detailStr.slice(0, 100);
    }
    if (tag !== undefined) {
      updateData.tag = String(tag).trim().slice(0, 5);
    }

    const p = updateData.province || addr.province;
    const c = updateData.city || addr.city;
    const d = updateData.district || addr.district;
    const dt = updateData.detail || addr.detail;
    if (province !== undefined || city !== undefined || district !== undefined || detail !== undefined) {
      updateData.fullAddress = p + c + d + dt;
    }

    if (isDefault === true) {
      const defaults = await db.collection('addresses')
        .where({ _openid: openid, isDefault: true })
        .get();
      for (const def of defaults.data) {
        if (def._id !== addressId) {
          await db.collection('addresses').doc(def._id).update({
            data: { isDefault: false },
          });
        }
      }
      updateData.isDefault = true;
    } else if (isDefault === false) {
      updateData.isDefault = false;
    }

    updateData.updatedAt = db.serverDate();

    await db.collection('addresses').doc(addressId).update({
      data: updateData,
    });

    const updated = await db.collection('addresses').doc(addressId).get();
    return { code: 0, data: updated.data };
  } catch (err) {
    console.error('updateAddress error:', err);
    return { code: -1, message: '更新地址失败' };
  }
};
