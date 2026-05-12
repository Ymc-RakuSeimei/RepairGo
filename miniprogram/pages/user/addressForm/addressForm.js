const { callCloud, isValidPhone } = require('../../../utils/util');

Page({
  data: {
    addressId: '',
    name: '',
    phone: '',
    tag: '',
    region: [],
    regionText: '',
    detail: '',
    isDefault: false,
    saving: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ addressId: options.id });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      this.loadAddressDetail(options.id);
    }
  },

  async loadAddressDetail(id) {
    const result = await callCloud('user/getAddresses', {});
    if (!result || result.code !== 0) return;

    const target = (result.data || []).find((item) => item._id === id);
    if (!target) return;

    const region = [target.province || '', target.city || '', target.district || ''].filter(Boolean);

    this.setData({
      name: target.name || '',
      phone: target.phone || '',
      tag: target.tag || '',
      region,
      regionText: region.join(' '),
      detail: target.detail || '',
      isDefault: !!target.isDefault,
    });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onRegionChange(e) {
    const region = e.detail.value || [];
    this.setData({
      region,
      regionText: region.join(' '),
    });
  },

  onDefaultChange(e) {
    this.setData({ isDefault: !!e.detail.value });
  },

  async onSave() {
    const { addressId, name, phone, tag, region, detail, isDefault, saving } = this.data;
    if (saving) return;

    if (!name.trim()) {
      wx.showToast({ title: '请输入联系人', icon: 'none' });
      return;
    }
    if (!isValidPhone(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!Array.isArray(region) || region.length !== 3) {
      wx.showToast({ title: '请选择所在地区', icon: 'none' });
      return;
    }
    if (!detail.trim()) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    const result = await callCloud('user/saveAddress', {
      addressId,
      name,
      phone,
      tag,
      region,
      detail,
      isDefault,
    });

    if (result && result.code === 0) {
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1200);
    }

    this.setData({ saving: false });
  },
});
