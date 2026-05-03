const { callCloud, checkRoleAsync, getUserRoles, getUserPendingRoles, hasPermission } = require('../../../utils/util');

Page({
  data: {
    loading: false,
    userInfo: null,
    roles: [],
    pendingRoles: [],
    hasTechnicianRole: false,
    hasAdminRole: false,
    techPending: false,
    adminPending: false,
  },

  async onShow() {
    const user = await checkRoleAsync('user');
    if (user) {
      const roles = getUserRoles(user);
      const pendingRoles = getUserPendingRoles(user);
      this.setData({
        userInfo: user,
        roles,
        pendingRoles,
        hasTechnicianRole: roles.includes('technician'),
        hasAdminRole: roles.includes('admin'),
        techPending: pendingRoles.includes('technician'),
        adminPending: pendingRoles.includes('admin'),
      });
    }
  },

  goCreateOrder() {
    wx.navigateTo({ url: '/pages/user/createOrder/createOrder' });
  },

  goOrderList() {
    wx.navigateTo({ url: '/pages/user/orderList/orderList' });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/user/feedback/feedback' });
  },

  goTechnicianHome() {
    wx.navigateTo({ url: '/pages/technician/home/home' });
  },

  goAdminHome() {
    wx.navigateTo({ url: '/pages/admin/home/home' });
  },

  goApplyTechnician() {
    wx.navigateTo({ url: '/pages/technician/register/register' });
  },

  goApplyAdmin() {
    wx.navigateTo({ url: '/pages/user/applyAdmin/applyAdmin' });
  },

  goBack() {
    wx.navigateBack();
  },
});
