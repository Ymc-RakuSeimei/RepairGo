const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    orders: [],
    loading: false,
    currentTab: 'all',
    tabs: [
      { key: 'all', text: '全部' },
      { key: 'ongoing', text: '进行中' },
      { key: 'awaiting_payment', text: '待付款' },
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
    const requestData = {};

    if (currentTab === 'ongoing') {
      requestData.statuses = ['pending', 'accepted', 'in_progress'];
    } else if (currentTab !== 'all') {
      requestData.status = currentTab;
    }

    const result = await callCloud('admin/getAllOrders', requestData);
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
