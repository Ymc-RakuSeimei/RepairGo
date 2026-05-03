const { callCloud, checkRoleAsync, getUserRoles, ORDER_STATUS } = require('../../../utils/util');

Page({
  data: {
    pendingOrders: [],
    loading: false,
    isRegistered: false,
    techInfo: null,
    userInfo: null,
    roles: [],
  },

  async onShow() {
    const user = await checkRoleAsync('technician');
    if (user) {
      const roles = getUserRoles(user);
      this.setData({ userInfo: user, roles });
      this.checkRegistration();
    }
  },

  async checkRegistration() {
    const result = await callCloud('technician/getProfile');
    if (result && result.code === 0 && result.data) {
      this.setData({ isRegistered: result.data.status === 'approved', techInfo: result.data });
      if (result.data.status === 'approved') {
        this.loadPendingOrders();
      }
    }
  },

  async loadPendingOrders() {
    this.setData({ loading: true });
    const result = await callCloud('technician/getPendingOrders');
    if (result && result.code === 0) {
      this.setData({ pendingOrders: result.data });
    }
    this.setData({ loading: false });
  },

  async onAcceptOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认接单', content: '确定要接受此订单吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    const result = await callCloud('technician/acceptOrder', { orderId });
    if (result && result.code === 0) {
      wx.showToast({ title: '接单成功', icon: 'success' });
      this.loadPendingOrders();
    }
  },

  goUserHome() {
    wx.navigateTo({ url: '/pages/user/home/home' });
  },

  goOrderList() {
    wx.navigateTo({ url: '/pages/technician/orderList/orderList' });
  },

  goIncome() {
    wx.navigateTo({ url: '/pages/technician/income/income' });
  },

  goProfile() {
    wx.navigateTo({ url: '/pages/technician/profile/profile' });
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/technician/register/register' });
  },

  goBack() {
    wx.navigateBack();
  },
});
