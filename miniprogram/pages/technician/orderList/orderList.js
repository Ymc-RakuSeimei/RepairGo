const { callCloud, checkRoleAsync, ORDER_STATUS, formatPreferredTime } = require('../../../utils/util');

Page({
  data: {
    orders: [],
    loading: false,
    currentTab: 'all',
    tabs: [
      { key: 'all', text: '全部' },
      { key: 'ongoing', text: '进行中' },
      { key: 'completed', text: '已完成' },
    ],
  },

  async onShow() {
    const user = await checkRoleAsync('technician');
    if (user) {
      this.loadOrders();
    }
  },

  async loadOrders() {
    this.setData({ loading: true });
    const { currentTab } = this.data;
    const requestData = {};

    if (currentTab === 'ongoing') {
      requestData.statuses = ['accepted', 'in_progress'];
    } else if (currentTab !== 'all') {
      requestData.status = currentTab;
    }

    const result = await callCloud('technician/getMyOrders', requestData);
    if (result && result.code === 0) {
      const orders = result.data.map(order => {
        const statusInfo = ORDER_STATUS[order.status] || {};
        return {
          ...order,
          statusText: statusInfo.text || order.status,
          statusColor: statusInfo.color || '#8E8E93',
          preferredTimeText: formatPreferredTime(order.preferredTime),
        };
      });
      this.setData({ orders });
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
    wx.navigateTo({ url: `/pages/technician/orderDetail/orderDetail?id=${orderId}` });
  },
});
