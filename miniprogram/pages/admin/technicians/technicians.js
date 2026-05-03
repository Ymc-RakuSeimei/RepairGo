const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    technicians: [],
    loading: false,
    currentTab: 'all',
    tabs: [
      { key: 'all', text: '全部' },
      { key: 'pending', text: '待审核' },
      { key: 'approved', text: '已通过' },
      { key: 'disabled', text: '已禁用' },
    ],
  },

  async onShow() {
    const user = await checkRoleAsync('admin');
    if (user) {
      this.loadTechnicians();
    }
  },

  async loadTechnicians() {
    this.setData({ loading: true });
    const { currentTab } = this.data;
    const status = currentTab === 'all' ? '' : currentTab;
    const result = await callCloud('admin/getTechnicians', { status });
    if (result && result.code === 0) {
      this.setData({ technicians: result.data.list });
    }
    this.setData({ loading: false });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadTechnicians();
  },

  goDetail(e) {
    const techId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin/technicianDetail/technicianDetail?id=${techId}` });
  },
});
