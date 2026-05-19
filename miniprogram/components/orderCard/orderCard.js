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
      const { role } = this.data;
      const baseStatusInfo = ORDER_STATUS[nextOrder.status] || {};
      let statusInfo = baseStatusInfo;
      if (role === 'technician' && nextOrder.status === 'accepted') {
        statusInfo = { ...baseStatusInfo, text: '进行中' };
      } else if (role === 'technician' && nextOrder.status === 'awaiting_payment') {
        statusInfo = { ...baseStatusInfo, text: '待用户付款' };
      }
      this.setData({
        statusInfo,
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
