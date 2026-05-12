const {
  callCloud,
  GENDER_OPTIONS,
  isValidPhone,
} = require('../../../utils/util');

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    phone: '',
    gender: 'unknown',
    genderOptions: GENDER_OPTIONS,
    saving: false,
    uploading: false,
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    const result = await callCloud('user/login', {});
    if (!result || result.code !== 0) return;

    const user = result.data || {};
    this.setData({
      avatarUrl: user.avatarUrl || '',
      nickName: user.nickName || '',
      phone: user.phone || '',
      gender: user.gender || 'unknown',
    });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ gender: e.currentTarget.dataset.value });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: async (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        if (!file || !file.tempFilePath) return;

        this.setData({ uploading: true });
        wx.showLoading({ title: '上传头像中...', mask: true });
        try {
          const ext = file.tempFilePath.split('.').pop() || 'png';
          const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath,
            filePath: file.tempFilePath,
          });
          this.setData({ avatarUrl: uploadRes.fileID });
        } catch (err) {
          console.error('upload avatar error:', err);
          wx.showToast({ title: '头像上传失败', icon: 'none' });
        } finally {
          wx.hideLoading();
          this.setData({ uploading: false });
        }
      },
    });
  },

  async onSave() {
    const { avatarUrl, nickName, phone, gender, saving, uploading } = this.data;
    if (saving || uploading) return;

    if (!nickName.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (phone && !isValidPhone(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    const result = await callCloud('user/updateProfile', {
      avatarUrl,
      nickName,
      phone,
      gender,
    });

    if (result && result.code === 0) {
      getApp().globalData.userInfo = result.data;
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1200);
    }

    this.setData({ saving: false });
  },
});
