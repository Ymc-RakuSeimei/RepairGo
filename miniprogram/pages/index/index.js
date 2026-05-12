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
    showPhoneBind: false,
    user: null,
    entryRole: '',
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

        setActualRole(entryRole);
        setCurrentRole(entryRole);

        // Check if phone is bound
        if (!user.phone) {
          this.setData({
            loading: false,
            showPhoneBind: true,
            user,
            entryRole,
          });
        } else {
          wx.redirectTo({ url: ROLE_MAP[entryRole].home });
        }
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

  async onGetPhoneNumber(e) {
    if (!e.detail.code) {
      wx.showToast({ title: '获取手机号失败', icon: 'none' });
      return;
    }

    const result = await callCloud('user/bindPhone', { code: e.detail.code });
    if (result && result.code === 0) {
      const userInfo = getApp().globalData.userInfo;
      if (userInfo) {
        userInfo.phone = result.data.phone;
      }
      wx.redirectTo({ url: ROLE_MAP[this.data.entryRole].home });
    } else {
      wx.showToast({ title: '手机号绑定失败，请重试', icon: 'none' });
    }
  },

  onSkipPhone() {
    wx.redirectTo({ url: ROLE_MAP[this.data.entryRole].home });
  },
});
