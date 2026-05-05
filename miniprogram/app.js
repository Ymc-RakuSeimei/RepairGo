App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-d5gj31502d98d7e43', 
      traceUser: true,
    });
  },

  globalData: {
    userInfo: null,
    currentRole: '',   // 当前扮演的角色: 'user' | 'technician' | 'admin'
    actualRole: '',    // 数据库中的真实最高角色
  },
});
