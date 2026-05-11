const { callCloud, GENDER_MAP } = require('../../../utils/util');

Page({
  data: {
    nickName: '',
    avatarUrl: '',
    gender: 0,
    genderOptions: ['未设置', '男', '女'],
    genderIndex: 0,
    uploading: false,
    saving: false,
  },

  onShow() {
    const user = getApp().globalData.userInfo;
    if (user) {
      const gender = user.gender || 0;
      this.setData({
        nickName: user.nickName || '',
        avatarUrl: user.avatarUrl || '',
        gender,
        genderIndex: gender,
      });
    }
  },

  onNicknameInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  onGenderChange(e) {
    const index = Number(e.detail.value);
    this.setData({
      genderIndex: index,
      gender: index,
    });
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

      const userInfo = getApp().globalData.userInfo;
      const openid = userInfo._openid || '';
      const ext = tempFilePath.split('.').pop() || 'jpg';
      const cloudPath = `avatars/${openid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath,
      });

      this.setData({
        avatarUrl: uploadRes.fileID,
        uploading: false,
      });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      this.setData({ uploading: false });
      wx.showToast({ title: '头像上传失败', icon: 'none' });
    }
  },

  async onSave() {
    const { nickName, avatarUrl, gender, saving } = this.data;
    if (saving) return;

    const trimmedName = nickName.trim();
    if (!trimmedName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (trimmedName.length > 20) {
      wx.showToast({ title: '昵称不能超过20个字', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    const result = await callCloud('user/updateProfile', {
      nickName: trimmedName,
      avatarUrl,
      gender,
    });

    this.setData({ saving: false });

    if (result && result.code === 0) {
      getApp().updateUserInfo(result.data);
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },
});
