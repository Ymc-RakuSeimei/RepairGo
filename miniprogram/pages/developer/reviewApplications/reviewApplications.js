const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    applications: [],
    loading: false,
  },

  async onShow() {
    const user = await checkRoleAsync('developer');
    if (user) {
      this.loadApplications();
    }
  },

  async loadApplications() {
    this.setData({ loading: true });
    const result = await callCloud('developer/reviewApplications', { action: 'list' });
    if (result && result.code === 0) {
      this.setData({ applications: result.data });
    }
    this.setData({ loading: false });
  },

  async onApprove(e) {
    const userId = e.currentTarget.dataset.id;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认通过', content: '确定通过该用户的管理员申请吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    const result = await callCloud('developer/reviewApplications', { action: 'approve', userId });
    if (result && result.code === 0) {
      wx.showToast({ title: '已通过', icon: 'success' });
      this.loadApplications();
    }
  },

  async onReject(e) {
    const userId = e.currentTarget.dataset.id;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认拒绝', content: '确定拒绝该用户的管理员申请吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    const result = await callCloud('developer/reviewApplications', { action: 'reject', userId });
    if (result && result.code === 0) {
      wx.showToast({ title: '已拒绝', icon: 'success' });
      this.loadApplications();
    }
  },
});
