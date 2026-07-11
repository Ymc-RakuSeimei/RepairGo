const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    
    if (userRes.data.length > 0) {
      const user = userRes.data[0];
      
      // Migrate: ensure roles array exists
      let needsUpdate = false;
      const updateData = {};
      if (!Array.isArray(user.roles)) {
        user.roles = [user.role || 'user'];
        needsUpdate = true;
        updateData.roles = user.roles;
      }
      if (!Array.isArray(user.pendingRoles)) {
        user.pendingRoles = [];
        needsUpdate = true;
        updateData.pendingRoles = user.pendingRoles;
      }
      if (typeof user.gender !== 'string') {
        user.gender = '';
        needsUpdate = true;
        updateData.gender = user.gender;
      }
      if (typeof user.defaultAddressId !== 'string') {
        user.defaultAddressId = '';
        needsUpdate = true;
        updateData.defaultAddressId = user.defaultAddressId;
      }
      if (typeof user.phone !== 'string') {
        user.phone = '';
        needsUpdate = true;
        updateData.phone = user.phone;
      }
      if (typeof user.address !== 'string') {
        user.address = '';
        needsUpdate = true;
        updateData.address = user.address;
      }
      if (typeof user.avatarUrl !== 'string') {
        user.avatarUrl = '';
        needsUpdate = true;
        updateData.avatarUrl = user.avatarUrl;
      }
      if (typeof user.nickName !== 'string') {
        user.nickName = '';
        needsUpdate = true;
        updateData.nickName = user.nickName;
      }
      
      if (needsUpdate) {
        updateData.updatedAt = db.serverDate();
        await db.collection('users').doc(user._id).update({ data: updateData });
      }
      
      return { code: 0, data: user };
    }

    // New user
    const newUser = {
      _openid: openid,
      roles: ['user'],
      pendingRoles: [],
      nickName: event.nickName || '',
      avatarUrl: event.avatarUrl || '',
      phone: '',
      address: '',
      gender: '',
      defaultAddressId: '',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };
    const addRes = await db.collection('users').add({ data: newUser });
    return { code: 0, data: { _id: addRes._id, ...newUser } };
  } catch (err) {
    console.error('login error:', err);
    return { code: -1, message: '登录失败' };
  }
};
