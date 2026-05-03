const { callCloud, checkRoleAsync, APPLIANCE_TYPES } = require('../../../utils/util');

Page({
  data: {
    type: '',
    title: '',
    content: '',
    images: [],
    submitting: false,
    types: [
      { value: 'complaint', text: '投诉' },
      { value: 'suggestion', text: '建议' },
      { value: 'question', text: '咨询' },
      { value: 'other', text: '其他' },
    ],
  },

  async onShow() {
    await checkRoleAsync('user');
  },

  onTypeChange(e) {
    this.setData({ type: e.detail.value });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  async onChooseImage() {
    const { images } = this.data;
    if (images.length >= 3) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' });
      return;
    }

    const res = await wx.chooseImage({ count: 3 - images.length });
    if (res && res.tempFilePaths) {
      this.setData({ images: [...images, ...res.tempFilePaths] });
    }
  },

  onRemoveImage(e) {
    const index = e.currentTarget.dataset.index;
    const { images } = this.data;
    images.splice(index, 1);
    this.setData({ images });
  },

  async onSubmit() {
    const { type, title, content, images } = this.data;
    if (!type) { wx.showToast({ title: '请选择反馈类型', icon: 'none' }); return; }
    if (!title.trim()) { wx.showToast({ title: '请输入标题', icon: 'none' }); return; }
    if (!content.trim()) { wx.showToast({ title: '请输入内容', icon: 'none' }); return; }

    this.setData({ submitting: true });
    const result = await callCloud('common/submitFeedback', {
      type,
      title,
      content,
      images,
      submitterRole: 'user',
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
    this.setData({ submitting: false });
  },
});
