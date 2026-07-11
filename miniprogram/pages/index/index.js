var util = require("../../utils/util");
var callCloud = util.callCloud;
var ROLE_MAP = util.ROLE_MAP;
var getUserRoles = util.getUserRoles;
var setCurrentRole = util.setCurrentRole;
var setActualRole = util.setActualRole;
var getEntryRole = util.getEntryRole;

Page({
  data: {
    loading: true,
    showLogin: false,
    showProfilePopup: false,
    user: null,
    entryRole: '',
    nickName: '',
    avatarUrl: '',
    avatarFileID: '',
    submitting: false,
  },

  onLoad() {
    this.loginAndRedirect();
  },

  async loginAndRedirect() {
    try {
      const result = await callCloud('user/login', {});
      if (result && result.code === 0) {
        const user = result.data;
        const roles = getUserRoles(user);
        const entryRole = getEntryRole(roles);
        getApp().globalData.userInfo = user;

        setActualRole(entryRole);
        setCurrentRole(entryRole);

        // 首次登录或资料不完整：展示一键登录
        if (!user.nickName || !user.avatarUrl) {
          this.setData({
            loading: false,
            showLogin: true,
            user: user,
            entryRole: entryRole,
            nickName: user.nickName || '',
            avatarUrl: user.avatarUrl || '',
            avatarFileID: user.avatarUrl || '',
          });
        } else {
          wx.redirectTo({ url: ROLE_MAP[entryRole].home });
        }
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
      }
    } catch (err) {
      console.error('Login failed:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '网络异常，请重试', icon: 'none' });
    }
  },

  onTapLogin() {
    this.setData({ showProfilePopup: true });
  },

  onCloseProfilePopup() {
    this.setData({ showProfilePopup: false });
  },

  preventMove() {},

  async onChooseAvatar(e) {
    const tempPath = e.detail.avatarUrl;
    if (!tempPath) return;

    try {
      wx.showLoading({ title: '上传头像中...', mask: true });
      const ext = tempPath.split('.').pop() || 'png';
      const cloudPath = 'avatars/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
      const uploadRes = await wx.cloud.uploadFile({ cloudPath: cloudPath, filePath: tempPath });
      this.setData({
        avatarUrl: tempPath,
        avatarFileID: uploadRes.fileID,
      });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      wx.showToast({ title: '头像上传失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onNickNameInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  goHome() {
    wx.redirectTo({ url: ROLE_MAP[this.data.entryRole].home });
  },

  async onConfirmProfile() {
    var nickName = (this.data.nickName || '').trim();
    var avatarFileID = this.data.avatarFileID;
    var user = this.data.user;

    if (!avatarFileID) {
      wx.showToast({ title: '请先选择微信头像', icon: 'none' });
      return;
    }
    if (!nickName) {
      wx.showToast({ title: '请先填写微信昵称', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    const result = await callCloud('user/updateProfile', {
      nickName: nickName,
      avatarUrl: avatarFileID,
      phone: (user && user.phone) || '',
      gender: (user && user.gender) || 'unknown',
    });

    if (result && result.code === 0) {
      getApp().globalData.userInfo = result.data;
      this.setData({ showProfilePopup: false });
      this.goHome();
    }
    this.setData({ submitting: false });
  },

  onSkipLogin() {
    this.goHome();
  },
});
