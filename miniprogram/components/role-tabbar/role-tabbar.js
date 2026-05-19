const iconPath = (name, active) => `/images/tabbar/${name}-${active ? 'active' : 'inactive'}.svg`;

const createTab = (key, label, url, iconName) => ({
  key,
  label,
  url,
  activeIcon: iconPath(iconName, true),
  inactiveIcon: iconPath(iconName, false),
});

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
          createTab('home', '首页', '/pages/user/home/home', 'home'),
          createTab('orders', '订单', '/pages/user/orderList/orderList', 'orders'),
          createTab('profile', '我的', '/pages/user/profile/profile', 'profile'),
        ],
        technician: [
          createTab('home', '首页', '/pages/technician/home/home', 'home'),
          createTab('orders', '工单', '/pages/technician/orderList/orderList', 'orders'),
          createTab('income', '收入', '/pages/technician/income/income', 'income'),
          createTab('profile', '我的', '/pages/technician/profile/profile', 'profile'),
        ],
        admin: [
          createTab('home', '首页', '/pages/admin/home/home', 'home'),
          createTab('orders', '工单', '/pages/admin/orderList/orderList', 'orders'),
          createTab('techs', '维修师傅', '/pages/admin/technicians/technicians', 'techs'),
          createTab('feedback', '反馈', '/pages/admin/feedbackList/feedbackList', 'feedback'),
          createTab('profile', '我的', '/pages/admin/profile/profile', 'profile'),
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
