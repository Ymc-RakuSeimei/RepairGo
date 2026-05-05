const { ROLE_MAP, ROLE_PRIORITY, setCurrentRole, getCurrentRole } = require('../../../utils/util');

Page({
  data: {
    currentRole: '',
    roles: [],
  },

  onLoad() {
    this.setData({ roles: this.getRoleOptions() });
  },

  onShow() {
    this.setData({ currentRole: getCurrentRole() });
  },

  getRoleOptions() {
    const roleMeta = {
      developer: { key: 'developer', text: '开发者', desc: '切换角色 · 审核管理申请', color: '#AF52DE' },
      admin: { key: 'admin', text: '管理人员', desc: '派单调度 · 师傅管理 · 反馈处理', color: '#FF9500' },
      technician: { key: 'technician', text: '维修师傅', desc: '接单维修 · 查看收入 · 管理工单', color: '#34C759' },
      user: { key: 'user', text: '普通用户', desc: '提交订单 · 追踪进度 · 意见反馈', color: '#2E6CE6' },
    };
    return ROLE_PRIORITY.map(role => roleMeta[role]);
  },

  onSwitchRole(e) {
    const role = e.currentTarget.dataset.role;
    if (role === this.data.currentRole) return;

    wx.showModal({
      title: '切换角色',
      content: `确定切换至「${ROLE_MAP[role].text}」视角吗？`,
      success: (res) => {
        if (res.confirm) {
          setCurrentRole(role);
          const homeUrl = ROLE_MAP[role].home;
          wx.redirectTo({ url: homeUrl });
        }
      }
    });
  },
});
