var util = require("../../utils/util");
var callCloud = util.callCloud;
var ROLE_MAP = util.ROLE_MAP;
var getUserRoles = util.getUserRoles;
var hasPermission = util.hasPermission;

Page({
  data: {
    loading: true,
    userInfo: null,
    showRoleSelect: false,
  },

  onLoad() {
    this.loginAndCheckRole();
  },

  async loginAndCheckRole() {
    try {
      const result = await callCloud('user/login', {});
      if (result && result.code === 0) {
        const user = result.data;
        const roles = getUserRoles(user);
        this.setData({ userInfo: user, loading: false });

        // Auto-redirect based on roles (priority: developer > admin > technician)
        if (roles.includes('developer')) {
          wx.redirectTo({ url: ROLE_MAP.developer.home });
          return;
        }
        if (roles.includes('admin')) {
          wx.redirectTo({ url: ROLE_MAP.admin.home });
          return;
        }
        if (roles.includes('technician')) {
          wx.redirectTo({ url: ROLE_MAP.technician.home });
          return;
        }
        
        // Only user role — show role selection
        this.setData({ showRoleSelect: true });
      } else {
        this.setData({ loading: false, showRoleSelect: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      this.setData({ loading: false, showRoleSelect: true });
    }
  },

  goUserHome() {
    wx.navigateTo({ url: ROLE_MAP.user.home });
  },

  goApplyTechnician() {
    wx.navigateTo({ url: '/pages/technician/register/register' });
  },

  goApplyAdmin() {
    wx.navigateTo({ url: '/pages/user/applyAdmin/applyAdmin' });
  },
});
