const { callCloud, checkRoleAsync, ORDER_STATUS, formatPreferredTime } = require('../../../utils/util');

Page({
  data: {
    order: null,
    loading: false,
    rating: 5,
    reviewContent: '',
    submitting: false,
    canCancel: false,
    canPay: false,
    canReview: false,
  },

  async onLoad(options) {
    const user = await checkRoleAsync('user');
    if (user && options.id) {
      this.loadOrder(options.id);
    }
  },

  async loadOrder(orderId) {
    this.setData({ loading: true });
    const result = await callCloud('common/getOrderDetail', { orderId });
    if (result && result.code === 0) {
      const order = result.data || {};
      this.setData({
        order: {
          ...order,
          preferredTimeText: formatPreferredTime(order.preferredTime),
        },
        canCancel: ['pending', 'accepted'].includes(order.status),
        canPay: order.status === 'awaiting_payment',
        canReview: order.status === 'completed',
      });
    }
    this.setData({ loading: false });
  },

  onReviewRatingChange(e) {
    this.setData({ rating: e.detail.value });
  },

  onReviewInput(e) {
    this.setData({ reviewContent: e.detail.value });
  },

  async onSubmitReview() {
    const { order, rating, reviewContent } = this.data;
    if (!reviewContent.trim()) {
      wx.showToast({ title: '请输入评价内容', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    const result = await callCloud('user/submitReview', {
      orderId: order._id,
      rating,
      content: reviewContent,
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '评价成功', icon: 'success' });
      this.loadOrder(order._id);
    }
    this.setData({ submitting: false });
  },

  async onPayOrder() {
    const { order } = this.data;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认付款', content: `确认支付维修费用 ¥${order.price || 0} 吗？`, success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    const result = await callCloud('user/payOrder', { orderId: order._id });
    if (result && result.code === 0) {
      wx.showToast({ title: '支付成功', icon: 'success' });
      this.loadOrder(order._id);
    }
  },

  async onCancel() {
    const { order } = this.data;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认取消', content: '确定取消此订单吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    const result = await callCloud('user/cancelOrder', { orderId: order._id });
    if (result && result.code === 0) {
      wx.showToast({ title: '已取消', icon: 'success' });
      this.loadOrder(order._id);
    }
  },
});
