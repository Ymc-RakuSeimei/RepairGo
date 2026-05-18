const { callCloud, checkRoleAsync, ORDER_STATUS, formatPreferredTime } = require('../../../utils/util');

Page({
  data: {
    order: null,
    loading: false,
    repairNotes: '',
    price: '',
    completing: false,
  },

  async onLoad(options) {
    const user = await checkRoleAsync('technician');
    if (user && options.id) {
      this.loadOrder(options.id);
    }
  },

  async loadOrder(orderId) {
    this.setData({ loading: true });
    const result = await callCloud('common/getOrderDetail', { orderId });
    if (result && result.code === 0) {
      this.setData({
        order: {
          ...result.data,
          preferredTimeText: formatPreferredTime(result.data.preferredTime),
        },
      });
    }
    this.setData({ loading: false });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  async onStartRepair() {
    const { order } = this.data;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认开始', content: '确定开始维修吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    const result = await callCloud('technician/updateOrderStatus', {
      orderId: order._id,
      orderAction: 'start',
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '已开始维修', icon: 'success' });
      this.loadOrder(order._id);
    }
  },

  async onCompleteRepair() {
    const { order, repairNotes, price } = this.data;
    if (!price) {
      wx.showToast({ title: '请输入维修费用', icon: 'none' });
      return;
    }

    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认完成', content: '确定维修完成吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    this.setData({ completing: true });
    const result = await callCloud('technician/updateOrderStatus', {
      orderId: order._id,
      orderAction: 'complete',
      repairNotes,
      price: parseFloat(price),
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '维修完成', icon: 'success' });
      this.loadOrder(order._id);
    }
    this.setData({ completing: false });
  },
});
