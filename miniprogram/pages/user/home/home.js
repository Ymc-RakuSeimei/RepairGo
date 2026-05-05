const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    userInfo: null,
  },

  async onShow() {
    const user = await checkRoleAsync('user');
    if (user) {
      this.setData({ userInfo: user });
    }
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
