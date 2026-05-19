const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    userInfo: null,
    ongoingOrders: [],
    ongoingOrderCount: 0,
    loading: false,
  },

  async onShow() {
    const user = await checkRoleAsync('user');
    if (user) {
      this.setData({ userInfo: user });
      this.loadHomeOrders();
    }
  },

  async loadHomeOrders() {
    this.setData({ loading: true });
    const result = await callCloud('user/getMyOrders', {
      statuses: ['accepted', 'in_progress'],
      pageSize: 20,
    });
    if (result && result.code === 0) {
      const ongoingOrders = Array.isArray(result.data) ? result.data : [];
      this.setData({
        ongoingOrders: ongoingOrders.slice(0, 3),
        ongoingOrderCount: ongoingOrders.length,
      });
    }
    this.setData({ loading: false });
  },

  goCreateOrder() {
    wx.navigateTo({ url: '/pages/user/createOrder/createOrder' });
  },

  goOrderList() {
    wx.navigateTo({ url: '/pages/user/orderList/orderList' });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/user/feedback/feedback' });
  },
});
