const { callCloud } = require('../../../utils/util');

Page({
  data: {
    addresses: [],
    loading: false,
    fromOrder: false,
  },

  onLoad(options) {
    if (options.fromOrder === '1') {
      this.setData({ fromOrder: true });
    }
  },

  onShow() {
    this.loadAddresses();
  },

  async loadAddresses() {
    this.setData({ loading: true });
    const result = await callCloud('user/getAddresses');
    if (result && result.code === 0) {
      this.setData({ addresses: result.data });
    }
    this.setData({ loading: false });
  },

  onAddAddress() {
    wx.navigateTo({ url: '/pages/user/addressEdit/addressEdit' });
  },

  onEditAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/user/addressEdit/addressEdit?id=' + id });
  },

  async onSetDefault(e) {
    const id = e.currentTarget.dataset.id;
    const result = await callCloud('user/setDefaultAddress', { addressId: id });
    if (result && result.code === 0) {
      this.loadAddresses();
    }
  },

  onDeleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await callCloud('user/deleteAddress', { addressId: id });
          if (result && result.code === 0) {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadAddresses();
          }
        }
      },
    });
  },

  onSelectAddress(e) {
    if (!this.data.fromOrder) return;
    const address = e.currentTarget.dataset.address;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.onAddressSelected) {
      prevPage.onAddressSelected(address);
    }
    wx.navigateBack();
  },
});
