const { callCloud, checkRoleAsync, ORDER_STATUS } = require('../../../utils/util');

Page({
  data: {
    order: null,
    loading: false,
    rating: 5,
    reviewContent: '',
    submitting: false,
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
      this.setData({ order: result.data });
    }
    this.setData({ loading: false });
  },

  onRatingChange(e) {
    this.setData({ rating: e.detail.rating });
  },

  onInputChange(e) {
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

  async onCancelOrder() {
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
