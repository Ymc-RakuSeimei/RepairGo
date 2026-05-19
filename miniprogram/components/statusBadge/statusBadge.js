const { ORDER_STATUS } = require('../../utils/util');

Component({
  properties: {
    status: { type: String, value: '' },
    text: { type: String, value: '' },
  },

  data: {
    info: {},
  },

  observers: {
    'status, text'(status, text) {
      const baseInfo = ORDER_STATUS[status] || { text: status, color: '#999' };
      this.setData({
        info: text ? { ...baseInfo, text } : baseInfo,
      });
    },
  },
});
