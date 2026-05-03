const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    loading: false,
    userInfo: null,
  },

  async onShow() {
    const user = await checkRoleAsync('developer');
    if (user) {
      this.setData({ userInfo: user });
    }
  },

  // 用户端功能
  goUserHome() { wx.navigateTo({ url: '/pages/user/home/home' }); },
  goCreateOrder() { wx.navigateTo({ url: '/pages/user/createOrder/createOrder' }); },
  goUserOrders() { wx.navigateTo({ url: '/pages/user/orderList/orderList' }); },

  // 维修工端功能
  goTechHome() { wx.navigateTo({ url: '/pages/technician/home/home' }); },
  goTechRegister() { wx.navigateTo({ url: '/pages/technician/register/register' }); },
  goTechOrders() { wx.navigateTo({ url: '/pages/technician/orderList/orderList' }); },
  goTechIncome() { wx.navigateTo({ url: '/pages/technician/income/income' }); },

  // 管理端功能
  goAdminHome() { wx.navigateTo({ url: '/pages/admin/home/home' }); },
  goAdminOrders() { wx.navigateTo({ url: '/pages/admin/orderList/orderList' }); },
  goAdminTechnicians() { wx.navigateTo({ url: '/pages/admin/technicians/technicians' }); },
  goAdminFeedback() { wx.navigateTo({ url: '/pages/admin/feedbackList/feedbackList' }); },

  // 开发者功能
  goReviewApplications() { wx.navigateTo({ url: '/pages/developer/reviewApplications/reviewApplications' }); },

  goBack() { wx.navigateBack(); },
});
