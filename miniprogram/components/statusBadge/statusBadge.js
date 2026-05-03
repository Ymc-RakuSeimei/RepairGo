const { ORDER_STATUS } = require('../../utils/util');

Component({
  properties: {
    status: { type: String, value: '' },
  },

  data: {
    info: {},
  },

  observers: {
    status(status) {
      this.setData({ info: ORDER_STATUS[status] || { text: status, color: '#999' } });
    },
  },
});
