const { callCloud, checkRoleAsync, setCurrentRole, ROLE_MAP } = require('../../../utils/util');

Page({
  data: {
    profile: null,
    loading: false,
    uploading: false,
  },

  async onShow() {
    const user = await checkRoleAsync('technician');
    if (user) {
      this.loadProfile();
    }
  },

  async loadProfile() {
    this.setData({ loading: true });
    const profileRes = await callCloud('technician/getProfile');

    if (profileRes && profileRes.code === 0) {
      this.setData({ profile: profileRes.data });
    }
    this.setData({ loading: false });
  },

  async onChooseAvatar() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      if (!res || !res.tempFiles || res.tempFiles.length === 0) return;

      const tempFilePath = res.tempFiles[0].tempFilePath;
      this.setData({ uploading: true });

      const profile = this.data.profile;
      const openid = profile._openid || '';
      const ext = tempFilePath.split('.').pop() || 'jpg';
      const cloudPath = `avatars/${openid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath,
      });

      const updateRes = await callCloud('technician/updateProfile', {
        avatarUrl: uploadRes.fileID,
      });

      if (updateRes && updateRes.code === 0) {
        this.setData({ profile: updateRes.data });
        wx.showToast({ title: '头像已更新', icon: 'success' });
      }

      this.setData({ uploading: false });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      this.setData({ uploading: false });
      wx.showToast({ title: '头像上传失败', icon: 'none' });
    }
  },

  switchToUser() {
    wx.showModal({
      title: '切换角色',
      content: '确定切换至普通用户视角吗？',
      success: (res) => {
        if (res.confirm) {
          setCurrentRole('user');
          wx.redirectTo({ url: ROLE_MAP.user.home });
        }
      }
    });
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/technician/register/register' });
  },
});
