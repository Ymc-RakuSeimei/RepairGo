const { callCloud } = require('../../../utils/util');

Page({
  data: {
    reason: '',
    submitting: false,
  },

  onInputChange(e) {
    this.setData({ reason: e.detail.value });
  },

  async onSubmit() {
    this.setData({ submitting: true });
    const result = await callCloud('user/applyAdmin', { reason: this.data.reason });
    if (result && result.code === 0) {
      wx.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
    this.setData({ submitting: false });
  },
});
