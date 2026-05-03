const { callCloud, checkRoleAsync, ORDER_STATUS } = require('../../../utils/util');

Page({
  data: {
    order: null,
    loading: false,
    availableTechs: [],
    selectedTechId: '',
    dispatching: false,
  },

  async onLoad(options) {
    const user = await checkRoleAsync('admin');
    if (user && options.id) {
      this.loadOrder(options.id);
      this.loadAvailableTechs();
    }
  },

  async loadOrder(orderId) {
    this.setData({ loading: true });
    const result = await callCloud('common/getOrderDetail', { orderId });
    if (result && result.code === 0) {
      this.setData({ order: result.data });
    }
    this.setData({ loading: false });
  },

  async loadAvailableTechs() {
    const result = await callCloud('admin/getAvailableTechs');
    if (result && result.code === 0) {
      this.setData({ availableTechs: result.data });
    }
  },

  onTechSelect(e) {
    const techId = e.detail.value;
    this.setData({ selectedTechId: techId });
  },

  async onDispatch() {
    const { order, selectedTechId } = this.data;
    if (!selectedTechId) {
      wx.showToast({ title: '请选择维修师傅', icon: 'none' });
      return;
    }

    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认派单', content: '确定派单给该师傅吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    this.setData({ dispatching: true });
    const result = await callCloud('admin/dispatchOrder', {
      orderId: order._id,
      technicianId: selectedTechId,
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '派单成功', icon: 'success' });
      this.loadOrder(order._id);
    }
    this.setData({ dispatching: false });
  },
});
