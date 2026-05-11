const { APPLIANCE_TYPES, callCloud } = require('../../../utils/util');

Page({
  data: {
    applianceTypes: APPLIANCE_TYPES,
    typeIndex: -1,
    brand: '',
    model: '',
    faultDesc: '',
    userName: '',
    userPhone: '',
    userAddress: '',
    preferredTime: '',
    images: [],
    submitting: false,
    selectedAddress: null,
  },

  onShow() {
    this.loadDefaultAddress();
  },

  async loadDefaultAddress() {
    const result = await callCloud('user/getAddresses');
    if (result && result.code === 0 && result.data.length > 0) {
      const defaultAddr = result.data.find(a => a.isDefault) || result.data[0];
      this.applyAddress(defaultAddr);
    }
  },

  applyAddress(addr) {
    this.setData({
      selectedAddress: addr,
      userName: addr.name || this.data.userName,
      userPhone: addr.phone || this.data.userPhone,
      userAddress: addr.fullAddress || this.data.userAddress,
    });
  },

  onAddressSelected(address) {
    this.applyAddress(address);
  },

  goAddressList() {
    wx.navigateTo({ url: '/pages/user/addressList/addressList?fromOrder=1' });
  },

  onTypeChange(e) {
    this.setData({ typeIndex: e.detail.value });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ preferredTime: e.detail.value });
  },

  chooseImage() {
    const remaining = 3 - this.data.images.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ images: [...this.data.images, ...newImages] });
      },
    });
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== idx);
    this.setData({ images });
  },

  async onSubmit() {
    const { typeIndex, applianceTypes, brand, faultDesc, userName, userPhone, userAddress, preferredTime, images } = this.data;

    if (typeIndex < 0) { wx.showToast({ title: '请选择电器类型', icon: 'none' }); return; }
    if (!userName.trim()) { wx.showToast({ title: '请填写姓名', icon: 'none' }); return; }
    if (!userPhone.trim()) { wx.showToast({ title: '请填写电话', icon: 'none' }); return; }
    if (!userAddress.trim()) { wx.showToast({ title: '请填写地址', icon: 'none' }); return; }
    if (!faultDesc.trim()) { wx.showToast({ title: '请描述故障', icon: 'none' }); return; }

    this.setData({ submitting: true });

    try {
      const imageFileIDs = [];
      for (const img of images) {
        const ext = img.split('.').pop();
        const cloudPath = `fault-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: img });
        imageFileIDs.push(uploadRes.fileID);
      }

      const result = await callCloud('user/createOrder', {
        applianceType: applianceTypes[typeIndex],
        applianceBrand: brand,
        faultDescription: faultDesc,
        userName,
        userPhone,
        userAddress,
        preferredTime,
        faultImages: imageFileIDs,
      });

      if (result) {
        wx.showToast({ title: '下单成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (err) {
      console.error('提交订单失败:', err);
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
