const { callCloud, formatFullAddress } = require('../../../utils/util');

Page({
  data: {
    addresses: [],
    mode: 'manage',
    loading: false,
  },

  onLoad(options) {
    this.setData({
      mode: options.mode === 'select' ? 'select' : 'manage',
    });
  },

  onShow() {
    this.loadAddresses();
  },

  async loadAddresses() {
    this.setData({ loading: true });
    const result = await callCloud('user/getAddresses', {});
    if (result && result.code === 0) {
      this.setData({
        addresses: (result.data || []).map((item) => ({
          ...item,
          displayAddress: formatFullAddress(item),
        })),
      });
    }
    this.setData({ loading: false });
  },

  goAddAddress() {
    wx.navigateTo({ url: '/pages/user/addressForm/addressForm' });
  },

  goEditAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/user/addressForm/addressForm?id=${id}` });
  },

  onSelectAddress(e) {
    if (this.data.mode !== 'select') return;

    const address = this.data.addresses.find((item) => item._id === e.currentTarget.dataset.id);
    if (!address) return;

    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('addressSelected', address);
    wx.navigateBack();
  },

  async onSetDefault(e) {
    const addressId = e.currentTarget.dataset.id;
    const result = await callCloud('user/setDefaultAddress', { addressId });
    if (result && result.code === 0) {
      wx.showToast({ title: '已设为默认地址', icon: 'success' });
      this.loadAddresses();
    }
  },

  onDeleteAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除地址',
      content: '确定删除该地址吗？',
      success: async (res) => {
        if (!res.confirm) return;
        const result = await callCloud('user/deleteAddress', { addressId });
        if (result && result.code === 0) {
          wx.showToast({ title: '已删除', icon: 'success' });
          this.loadAddresses();
        }
      },
    });
  },
});
