const { callCloud, checkRoleAsync, setCurrentRole, ROLE_MAP } = require('../../../utils/util');

Page({
  data: {
    profile: null,
    loading: false,
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
