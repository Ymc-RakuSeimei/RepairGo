const COLLECTION_NAME = 'user_addresses';

function isValidPhone(phone) {
  return /^1\d{10}$/.test(String(phone || '').trim());
}

function normalizeAddressPayload(payload = {}) {
  const region = Array.isArray(payload.region) ? payload.region : [];
  const province = String(payload.province || region[0] || '').trim();
  const city = String(payload.city || region[1] || '').trim();
  const district = String(payload.district || region[2] || '').trim();
  const detail = String(payload.detail || '').trim();

  return {
    name: String(payload.name || '').trim(),
    phone: String(payload.phone || '').trim(),
    tag: String(payload.tag || '').trim(),
    province,
    city,
    district,
    detail,
    region: [province, city, district].filter(Boolean),
    fullAddress: [province, city, district, detail].filter(Boolean).join(' '),
    isDefault: !!payload.isDefault,
  };
}

async function getUserByOpenid(db, openid) {
  const userRes = await db.collection('users').where({ _openid: openid }).get();
  return userRes.data.length > 0 ? userRes.data[0] : null;
}

async function syncDefaultAddressToUser(db, openid, addressDoc) {
  const user = await getUserByOpenid(db, openid);
  if (!user) return;

  await db.collection('users').doc(user._id).update({
    data: {
      address: addressDoc ? addressDoc.fullAddress : '',
      defaultAddressId: addressDoc ? addressDoc._id : '',
      updatedAt: db.serverDate(),
    },
  });
}

async function clearDefaultFlagForUser(db, openid, exceptId) {
  const res = await db.collection(COLLECTION_NAME).where({
    _openid: openid,
    isDefault: true,
  }).get();

  const updates = res.data
    .filter((item) => item._id !== exceptId)
    .map((item) => db.collection(COLLECTION_NAME).doc(item._id).update({
      data: {
        isDefault: false,
        updatedAt: db.serverDate(),
      },
    }));

  await Promise.all(updates);
}

async function ensureDefaultAddress(db, openid) {
  const addressRes = await db.collection(COLLECTION_NAME).where({ _openid: openid }).get();
  const addresses = addressRes.data;

  if (!addresses.length) {
    await syncDefaultAddressToUser(db, openid, null);
    return [];
  }

  let defaultAddress = addresses.find((item) => item.isDefault) || null;

  if (!defaultAddress) {
    defaultAddress = addresses[0];
    await db.collection(COLLECTION_NAME).doc(defaultAddress._id).update({
      data: {
        isDefault: true,
        updatedAt: db.serverDate(),
      },
    });
    defaultAddress.isDefault = true;
  }

  await clearDefaultFlagForUser(db, openid, defaultAddress._id);
  await syncDefaultAddressToUser(db, openid, defaultAddress);

  return addresses.map((item) => ({
    ...item,
    isDefault: item._id === defaultAddress._id,
  }));
}

async function migrateLegacyDefaultAddress(db, openid) {
  const user = await getUserByOpenid(db, openid);
  if (!user || !user.address) return;

  const existingRes = await db.collection(COLLECTION_NAME).where({ _openid: openid }).get();
  if (existingRes.data.length > 0) return;

  await db.collection(COLLECTION_NAME).add({
    data: {
      _openid: openid,
      name: user.nickName || '联系人',
      phone: user.phone || '',
      tag: '常用',
      province: '',
      city: '',
      district: '',
      detail: user.address,
      fullAddress: user.address,
      isDefault: true,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    },
  });
}

module.exports = {
  COLLECTION_NAME,
  isValidPhone,
  normalizeAddressPayload,
  getUserByOpenid,
  syncDefaultAddressToUser,
  clearDefaultFlagForUser,
  ensureDefaultAddress,
  migrateLegacyDefaultAddress,
};
