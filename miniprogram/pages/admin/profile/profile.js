const { callCloud, checkRoleAsync, getUserRoles, getActualRole, setCurrentRole, ROLE_MAP } = require('../../../utils/util');

Page({
  data: {
    userInfo: null,
    roles: [],
    isDeveloper: false,
    hasUserRole: false,
  },

  async onShow() {
    const user = await checkRoleAsync('admin');
    if (user) {
      const roles = getUserRoles(user);
      const actualRole = getActualRole();
      this.setData({
        userInfo: user,
        roles,
        isDeveloper: actualRole === 'developer',
        hasUserRole: roles.includes('user'),
      });
    }
  },

  switchToUser() {
    wx.showModal({
      title: '切换角色',
      content: '确定切换至普通用户视角吗？',
      success: (res) => {
        if (res.confirm) {
          setCurrentRole('user');
          wx.redirectTo({ url: ROLE_MAP.user.home });
        }
      }
    });
  },

  goReviewApplications() {
    wx.navigateTo({ url: '/pages/developer/reviewApplications/reviewApplications' });
  },

  goRoleSwitch() {
    wx.navigateTo({ url: '/pages/developer/roleSwitch/roleSwitch' });
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          getApp().globalData.userInfo = null;
          getApp().globalData.currentRole = '';
          getApp().globalData.actualRole = '';
          wx.redirectTo({ url: '/pages/index/index' });
        }
      }
    });
  },
});
