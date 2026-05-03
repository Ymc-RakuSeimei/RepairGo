const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    feedbackList: [],
    loading: false,
    currentTab: 'all',
    tabs: [
      { key: 'all', text: '全部' },
      { key: 'open', text: '待处理' },
      { key: 'replied', text: '已回复' },
      { key: 'closed', text: '已关闭' },
    ],
  },

  async onShow() {
    const user = await checkRoleAsync('admin');
    if (user) {
      this.loadFeedback();
    }
  },

  async loadFeedback() {
    this.setData({ loading: true });
    const { currentTab } = this.data;
    const status = currentTab === 'all' ? '' : currentTab;
    const result = await callCloud('admin/getFeedback', { status });
    if (result && result.code === 0) {
      this.setData({ feedbackList: result.data.list });
    }
    this.setData({ loading: false });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadFeedback();
  },

  goDetail(e) {
    const feedbackId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin/feedbackDetail/feedbackDetail?id=${feedbackId}` });
  },
});
