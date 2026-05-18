const { ORDER_STATUS, formatDate, formatPreferredTime } = require('../../utils/util');

Component({
  properties: {
    order: { type: Object, value: {} },
    role: { type: String, value: 'user' },
  },

  data: {
    statusInfo: {},
    preferredTimeText: '',
  },

  observers: {
    order(order) {
      const nextOrder = order || {};
      this.setData({
        statusInfo: ORDER_STATUS[nextOrder.status] || {},
        preferredTimeText: formatPreferredTime(nextOrder.preferredTime),
      });
    },
  },

  methods: {
    onTap() {
      const { role, order } = this.data;
      const detailPage = role === 'admin'
        ? '/pages/admin/orderDetail/orderDetail'
        : role === 'technician'
          ? '/pages/technician/orderDetail/orderDetail'
          : '/pages/user/orderDetail/orderDetail';
      wx.navigateTo({ url: `${detailPage}?id=${order._id}` });
    },

    formatTime(time) {
      return formatDate(time);
    },
  },
});
