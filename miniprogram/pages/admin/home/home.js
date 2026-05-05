const { callCloud, checkRoleAsync } = require("../../../utils/util");

Page({
  data: {
    stats: {
      pendingOrders: 0,
      activeOrders: 0,
      onlineTechs: 0,
      todayCompleted: 0,
    },
    loading: false,
    userInfo: null,
  },

  async onShow() {
    const user = await checkRoleAsync('admin');
    if (user) {
      this.setData({ userInfo: user });
      this.loadStats();
    }
  },

  async loadStats() {
    this.setData({ loading: true });
    const result = await callCloud("admin/getStats");
    if (result && result.code === 0) {
      this.setData({ stats: result.data });
    }
    this.setData({ loading: false });
  },

  goOrderList() { wx.navigateTo({ url: "/pages/admin/orderList/orderList" }); },
  goTechnicians() { wx.navigateTo({ url: "/pages/admin/technicians/technicians" }); },
  goFeedbackList() { wx.navigateTo({ url: "/pages/admin/feedbackList/feedbackList" }); },
});
