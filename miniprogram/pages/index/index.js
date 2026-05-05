var util = require("../../utils/util");
var callCloud = util.callCloud;
var ROLE_MAP = util.ROLE_MAP;
var getUserRoles = util.getUserRoles;
var setCurrentRole = util.setCurrentRole;
var setActualRole = util.setActualRole;
var getEntryRole = util.getEntryRole;

Page({
  data: {
    loading: true,
  },

  onLoad() {
    this.loginAndRedirect();
  },

  async loginAndRedirect() {
    try {
      const result = await callCloud('user/login', {});
      if (result && result.code === 0) {
        const user = result.data;
        const roles = getUserRoles(user);
        const entryRole = getEntryRole(roles);
        getApp().globalData.userInfo = user;

        // Actual role and entry role both follow the same priority order.
        setActualRole(entryRole);
        setCurrentRole(entryRole);

        // Redirect to entry role's home
        wx.redirectTo({ url: ROLE_MAP[entryRole].home });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
    } catch (err) {
      console.error('Login failed:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  },
});
