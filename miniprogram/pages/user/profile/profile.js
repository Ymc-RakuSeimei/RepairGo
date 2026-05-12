const {
  checkRoleAsync,
  getUserRoles,
  getUserPendingRoles,
  getActualRole,
  setCurrentRole,
  ROLE_MAP,
  getGenderLabel,
} = require('../../../utils/util');

Page({
  data: {
    userInfo: null,
    roles: [],
    pendingRoles: [],
    isDeveloper: false,
    techPending: false,
    hasTechnicianRole: false,
    hasAdminRole: false,
    genderText: '未设置',
  },

  async onShow() {
    const user = await checkRoleAsync('user');
    if (user) {
      const roles = getUserRoles(user);
      const pendingRoles = getUserPendingRoles(user);
      const actualRole = getActualRole();
      this.setData({
        userInfo: user,
        roles,
        pendingRoles,
        isDeveloper: actualRole === 'developer',
        techPending: pendingRoles.includes('technician'),
        hasTechnicianRole: roles.includes('technician'),
        hasAdminRole: roles.includes('admin'),
        genderText: getGenderLabel(user.gender),
      });
      this.loadStats();
    }
  },

  goEditProfile() {
    wx.navigateTo({ url: '/pages/user/editProfile/editProfile' });
  },

  goAddressList() {
    wx.navigateTo({ url: '/pages/user/addressList/addressList' });
  },

  goMyOrders() {
    wx.navigateTo({ url: '/pages/user/orderList/orderList' });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/user/feedback/feedback' });
  },

  goApplyTechnician() {
    wx.navigateTo({ url: '/pages/technician/register/register' });
  },

  goRoleSwitch() {
    wx.navigateTo({ url: '/pages/developer/roleSwitch/roleSwitch' });
  },

  switchToTechnician() {
    wx.showModal({
      title: '切换角色',
      content: '确定切换至维修工视角吗？',
      success: (res) => {
        if (res.confirm) {
          setCurrentRole('technician');
          wx.redirectTo({ url: ROLE_MAP.technician.home });
        }
      }
    });
  },

  switchToAdmin() {
    wx.showModal({
      title: '切换角色',
      content: '确定切换至管理员视角吗？',
      success: (res) => {
        if (res.confirm) {
          setCurrentRole('admin');
          wx.redirectTo({ url: ROLE_MAP.admin.home });
        }
      }
    });
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
