const {
  APPLIANCE_TYPES,
  callCloud,
  formatFullAddress,
} = require('../../../utils/util');

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

  onLoad() {
    this.prefillContactInfo();
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

  async prefillContactInfo() {
    const loginRes = await callCloud('user/login', {});
    if (loginRes && loginRes.code === 0) {
      const user = loginRes.data || {};
      const updateData = {};

      if (!this.data.userName && user.nickName) updateData.userName = user.nickName;
      if (!this.data.userPhone && user.phone) updateData.userPhone = user.phone;

      if (Object.keys(updateData).length) {
        this.setData(updateData);
      }
    }

    const addressRes = await callCloud('user/getAddresses', {});
    if (addressRes && addressRes.code === 0) {
      const defaultAddress = (addressRes.data || []).find((item) => item.isDefault) || null;
      if (defaultAddress) {
        this.applySelectedAddress(defaultAddress, false);
      }
    }
  },

  applySelectedAddress(address, overwrite = true) {
    const nextData = {
      selectedAddress: address,
    };

    if (overwrite || !this.data.userName) {
      nextData.userName = address.name || this.data.userName;
    }
    if (overwrite || !this.data.userPhone) {
      nextData.userPhone = address.phone || this.data.userPhone;
    }
    if (overwrite || !this.data.userAddress) {
      nextData.userAddress = formatFullAddress(address);
    }

    this.setData(nextData);
  },

  goSelectAddress() {
    wx.navigateTo({
      url: '/pages/user/addressList/addressList?mode=select',
      success: (res) => {
        res.eventChannel.on('addressSelected', (address) => {
          this.applySelectedAddress(address, true);
        });
      },
    });
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
      // 上传图片到云存储
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
