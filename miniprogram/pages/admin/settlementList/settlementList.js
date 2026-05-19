const { callCloud, checkRoleAsync, formatDate } = require('../../../utils/util');

Page({
  data: {
    list: [],
    loading: false,
    settlingId: '',
  },

  async onShow() {
    const user = await checkRoleAsync('admin');
    if (user) {
      this.loadList();
    }
  },

  async loadList() {
    this.setData({ loading: true });
    const result = await callCloud('admin/getPendingSettlements');
    if (result && result.code === 0) {
      this.setData({
        list: (result.data || []).map(item => ({
          ...item,
          createdAtText: item.createdAt ? formatDate(item.createdAt) : '',
          paidAtText: item.paidAt ? formatDate(item.paidAt) : '',
        })),
      });
    }
    this.setData({ loading: false });
  },

  async onSettle(e) {
    const incomeId = e.currentTarget.dataset.id;
    if (!incomeId) return;

    const confirm = await new Promise(resolve => {
      wx.showModal({
        title: '确认结算',
        content: '确认将该笔收入结算给维修师傅吗？',
        success: (res) => resolve(res.confirm),
      });
    });
    if (!confirm) return;

    this.setData({ settlingId: incomeId });
    const result = await callCloud('admin/settleIncome', { incomeId });
    if (result && result.code === 0) {
      wx.showToast({ title: '结算成功', icon: 'success' });
      this.loadList();
    }
    this.setData({ settlingId: '' });
  },
});
