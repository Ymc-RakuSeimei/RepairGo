const { callCloud, checkRoleAsync, ORDER_STATUS } = require('../../../utils/util');

Page({
  data: {
    orders: [],
    loading: false,
    currentTab: 'all',
    tabs: [
      { key: 'all', text: '全部' },
      { key: 'pending', text: '待处理' },
      { key: 'accepted', text: '已接单' },
      { key: 'in_progress', text: '维修中' },
      { key: 'completed', text: '已完成' },
    ],
  },

  async onShow() {
    const user = await checkRoleAsync('admin');
    if (user) {
      this.loadOrders();
    }
  },

  async loadOrders() {
    this.setData({ loading: true });
    const { currentTab } = this.data;
    const status = currentTab === 'all' ? '' : currentTab;
    const result = await callCloud('admin/getAllOrders', { status });
    if (result && result.code === 0) {
      this.setData({ orders: result.data.list });
    }
    this.setData({ loading: false });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadOrders();
  },

  goDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin/orderDetail/orderDetail?id=${orderId}` });
  },
});
