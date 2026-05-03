const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    tech: null,
    loading: false,
    actionLoading: false,
  },

  async onLoad(options) {
    const user = await checkRoleAsync('admin');
    if (user && options.id) {
      this.loadTechnician(options.id);
    }
  },

  async loadTechnician(techId) {
    this.setData({ loading: true });
    const result = await callCloud('admin/getTechnicianDetail', { technicianId: techId });
    if (result && result.code === 0) {
      this.setData({ tech: result.data });
    }
    this.setData({ loading: false });
  },

  async onApprove() {
    const { tech } = this.data;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认审核', content: '确定通过该师傅的注册申请吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    this.setData({ actionLoading: true });
    const result = await callCloud('admin/manageTechnician', {
      technicianId: tech._id,
      manageAction: 'approve',
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '审核通过', icon: 'success' });
      this.loadTechnician(tech._id);
    }
    this.setData({ actionLoading: false });
  },

  async onReject() {
    const { tech } = this.data;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认拒绝', content: '确定拒绝该师傅的注册申请吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    this.setData({ actionLoading: true });
    const result = await callCloud('admin/manageTechnician', {
      technicianId: tech._id,
      manageAction: 'reject',
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '已拒绝', icon: 'success' });
      this.loadTechnician(tech._id);
    }
    this.setData({ actionLoading: false });
  },

  async onDisable() {
    const { tech } = this.data;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认禁用', content: '确定禁用该师傅吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    this.setData({ actionLoading: true });
    const result = await callCloud('admin/manageTechnician', {
      technicianId: tech._id,
      manageAction: 'disable',
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '已禁用', icon: 'success' });
      this.loadTechnician(tech._id);
    }
    this.setData({ actionLoading: false });
  },
});
