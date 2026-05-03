const { ORDER_STATUS, formatDate } = require('../../utils/util');

Component({
  properties: {
    order: { type: Object, value: {} },
    role: { type: String, value: 'user' },
  },

  data: {
    statusInfo: {},
  },

  observers: {
    'order.status'(status) {
      this.setData({ statusInfo: ORDER_STATUS[status] || {} });
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
