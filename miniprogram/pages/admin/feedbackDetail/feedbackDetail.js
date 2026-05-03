const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    feedback: null,
    loading: false,
    replyContent: '',
    replying: false,
  },

  async onLoad(options) {
    const user = await checkRoleAsync('admin');
    if (user && options.id) {
      this.loadFeedback(options.id);
    }
  },

  async loadFeedback(feedbackId) {
    this.setData({ loading: true });
    const result = await callCloud('admin/getFeedbackDetail', { feedbackId });
    if (result && result.code === 0) {
      this.setData({ feedback: result.data });
    }
    this.setData({ loading: false });
  },

  onInputChange(e) {
    this.setData({ replyContent: e.detail.value });
  },

  async onReply() {
    const { feedback, replyContent } = this.data;
    if (!replyContent.trim()) {
      wx.showToast({ title: '请输入回复内容', icon: 'none' });
      return;
    }

    this.setData({ replying: true });
    const result = await callCloud('admin/replyFeedback', {
      feedbackId: feedback._id,
      content: replyContent,
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '回复成功', icon: 'success' });
      this.setData({ replyContent: '' });
      this.loadFeedback(feedback._id);
    }
    this.setData({ replying: false });
  },

  async onClose() {
    const { feedback } = this.data;
    const confirm = await new Promise(resolve => {
      wx.showModal({ title: '确认关闭', content: '确定关闭此反馈吗？', success: (res) => resolve(res.confirm) });
    });
    if (!confirm) return;

    const result = await callCloud('admin/closeFeedback', { feedbackId: feedback._id });
    if (result && result.code === 0) {
      wx.showToast({ title: '已关闭', icon: 'success' });
      this.loadFeedback(feedback._id);
    }
  },
});
