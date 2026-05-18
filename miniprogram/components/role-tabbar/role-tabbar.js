Component({
  properties: {
    role: { type: String, value: 'user' },
    current: { type: String, value: 'home' },
  },

  data: {
    tabs: [],
  },

  observers: {
    role(val) {
      this.setData({ tabs: this.getTabs(val) });
    },
  },

  lifetimes: {
    attached() {
      this.setData({ tabs: this.getTabs(this.data.role) });
    },
  },

  methods: {
    getTabs(role) {
      const map = {
        user: [
          { key: 'home', icon: '⌂', label: '首页', url: '/pages/user/home/home' },
          { key: 'orders', icon: '☰', label: '订单', url: '/pages/user/orderList/orderList' },
          { key: 'profile', icon: '☺', label: '我的', url: '/pages/user/profile/profile' },
        ],
        technician: [
          { key: 'home', icon: '⌂', label: '首页', url: '/pages/technician/home/home' },
          { key: 'orders', icon: '☰', label: '工单', url: '/pages/technician/orderList/orderList' },
          { key: 'income', icon: '¤', label: '收入', url: '/pages/technician/income/income' },
          { key: 'profile', icon: '☺', label: '我的', url: '/pages/technician/profile/profile' },
        ],
        admin: [
          { key: 'home', icon: '⌂', label: '首页', url: '/pages/admin/home/home' },
          { key: 'orders', icon: '☰', label: '工单', url: '/pages/admin/orderList/orderList' },
          { key: 'techs', icon: '⚙', label: '维修师傅', url: '/pages/admin/technicians/technicians' },
          { key: 'feedback', icon: '✎', label: '反馈', url: '/pages/admin/feedbackList/feedbackList' },
          { key: 'profile', icon: '☺', label: '我的', url: '/pages/admin/profile/profile' },
        ],
      };
      return map[role] || map.user;
    },

    onTabTap(e) {
      const url = e.currentTarget.dataset.url;
      const key = e.currentTarget.dataset.key;
      if (key === this.data.current) return;
      wx.redirectTo({ url });
    },
  },
});
