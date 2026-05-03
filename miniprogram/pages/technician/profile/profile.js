const { callCloud, checkRoleAsync } = require('../../../utils/util');

Page({
  data: {
    profile: null,
    reviews: [],
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
    const [profileRes, reviewsRes] = await Promise.all([
      callCloud('technician/getProfile'),
      callCloud('technician/getReviews', { technicianId: '' }),
    ]);
    
    if (profileRes && profileRes.code === 0) {
      this.setData({ profile: profileRes.data });
      
      if (profileRes.data) {
        const reviewsResult = await callCloud('technician/getReviews', {
          technicianId: profileRes.data._id,
        });
        if (reviewsResult && reviewsResult.code === 0) {
          this.setData({ reviews: reviewsResult.data });
        }
      }
    }
    this.setData({ loading: false });
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/technician/register/register' });
  },
});
