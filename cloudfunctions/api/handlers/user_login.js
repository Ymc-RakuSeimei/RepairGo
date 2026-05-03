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
      if (!Array.isArray(user.roles)) {
        user.roles = [user.role || 'user'];
        needsUpdate = true;
      }
      if (!Array.isArray(user.pendingRoles)) {
        user.pendingRoles = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await db.collection('users').doc(user._id).update({
          data: { roles: user.roles, pendingRoles: user.pendingRoles, updatedAt: db.serverDate() },
        });
      }
      
      return { code: 0, data: user };
    }

    // New user
    const newUser = {
      _openid: openid,
      role: 'user',
      roles: ['user'],
      pendingRoles: [],
      nickName: event.nickName || '',
      avatarUrl: event.avatarUrl || '',
      phone: '',
      address: '',
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
