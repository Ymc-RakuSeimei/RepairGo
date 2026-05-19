const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    pendingOrders: [],
    ongoingOrders: [],
    loading: false,
    isRegistered: false,
    techInfo: null,
    userInfo: null,
  },

  async onShow() {
    const user = await checkRoleAsync('technician');
    if (user) {
      this.setData({ userInfo: user });
      this.checkRegistration();
    }
  },

  async checkRegistration() {
    const result = await callCloud('technician/getProfile');
    if (result && result.code === 0 && result.data) {
      this.setData({ isRegistered: result.data.status === 'approved', techInfo: result.data });
      if (result.data.status === 'approved') {
        this.loadHomeOrders();
      }
    }
  },

  async loadHomeOrders() {
    this.setData({ loading: true });
    const ongoingResult = await callCloud('technician/getMyOrders', {
      statuses: ['accepted', 'in_progress'],
    });
    if (ongoingResult && ongoingResult.code === 0) {
      this.setData({ ongoingOrders: ongoingResult.data });
    }

    const pendingResult = await callCloud('technician/getPendingOrders');
    if (pendingResult && pendingResult.code === 0) {
      this.setData({ pendingOrders: pendingResult.data });
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
      this.loadHomeOrders();
    }
  },

  goOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/technician/orderDetail/orderDetail?id=${orderId}` });
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
});
