const { callCloud, checkRoleAsync, formatDate, INCOME_STATUS } = require('../../../utils/util');

Page({
  data: {
    incomeList: [],
    loading: false,
    totalSettled: 0,
    totalPending: 0,
  },

  async onShow() {
    const user = await checkRoleAsync('technician');
    if (user) {
      this.loadIncome();
    }
  },

  async loadIncome() {
    this.setData({ loading: true });
    const result = await callCloud('technician/getIncome');
    if (result && result.code === 0) {
      const list = result.data || [];
      let totalSettled = 0;
      let totalPending = 0;
      list.forEach(item => {
        if (item.status === 'settled') {
          totalSettled += item.amount;
        } else {
          totalPending += item.amount;
        }
      });
      this.setData({
        incomeList: list.map(item => ({
          ...item,
          createdAtStr: item.createdAt ? formatDate(item.createdAt) : '',
          statusText: (INCOME_STATUS[item.status] || {}).text || item.status,
        })),
        totalSettled,
        totalPending,
      });
    }
    this.setData({ loading: false });
  },

  formatDate(date) {
    return formatDate(date);
  },
});
