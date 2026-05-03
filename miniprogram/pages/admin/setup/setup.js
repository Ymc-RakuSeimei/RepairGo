const { callCloud } = require('../../../utils/util');

Page({
  data: {
    loading: false,
    setupComplete: false,
    setupType: '', // 'admin' or 'developer'
  },

  async onLoad() {
    // Show options for first-time setup
  },

  async onSetAdmin() {
    this.setData({ loading: true, setupType: 'admin' });
    const result = await callCloud('admin/setup', { type: 'firstAdmin' });
    if (result && result.code === 0) {
      this.setData({ setupComplete: true });
      wx.showToast({ title: '已设置为管理员', icon: 'success' });
    }
    this.setData({ loading: false });
  },

  async onSetDeveloper() {
    this.setData({ loading: true, setupType: 'developer' });
    const result = await callCloud('admin/setup', { type: 'firstDeveloper' });
    if (result && result.code === 0) {
      this.setData({ setupComplete: true });
      wx.showToast({ title: '已设置为开发者', icon: 'success' });
    }
    this.setData({ loading: false });
  },

  goHome() {
    wx.redirectTo({ url: '/pages/index/index' });
  },
});
