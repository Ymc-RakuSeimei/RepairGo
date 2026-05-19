const { callCloud } = require('../../../utils/util');

Page({
  data: {
    addressId: '',
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    tag: '',
    isDefault: false,
    tags: ['家', '公司', '学校', '其他'],
    region: [],
    saving: false,
    isEdit: false,
  },

  async onLoad(options) {
    if (options.id) {
      this.setData({ addressId: options.id, isEdit: true });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      await this.loadAddress(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' });
    }
  },

  async loadAddress(id) {
    const result = await callCloud('user/getAddresses');
    if (result && result.code === 0) {
      const addr = result.data.find(a => a._id === id);
      if (addr) {
        this.setData({
          name: addr.name,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          district: addr.district,
          detail: addr.detail,
          tag: addr.tag || '',
          isDefault: addr.isDefault,
          region: [addr.province, addr.city, addr.district],
        });
      }
    }
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onRegionChange(e) {
    const [province, city, district] = e.detail.value;
    this.setData({
      province,
      city,
      district,
      region: [province, city, district],
    });
  },

  onTagSelect(e) {
    const selectedTag = e.currentTarget.dataset.tag;
    this.setData({
      tag: this.data.tag === selectedTag ? '' : selectedTag,
    });
  },

  onDefaultChange(e) {
    this.setData({ isDefault: e.detail.value });
  },

  async onSave() {
    const { name, phone, province, city, district, detail, tag, isDefault, addressId, saving } = this.data;
    if (saving) return;

    if (!name.trim()) {
      wx.showToast({ title: '请填写联系人姓名', icon: 'none' });
      return;
    }
    if (!phone.trim()) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' });
      return;
    }
    if (!province || !city || !district) {
      wx.showToast({ title: '请选择省市区', icon: 'none' });
      return;
    }
    if (!detail.trim()) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      province,
      city,
      district,
      detail: detail.trim(),
      tag,
      isDefault,
    };

    let result;
    if (addressId) {
      payload.addressId = addressId;
      result = await callCloud('user/updateAddress', payload);
    } else {
      result = await callCloud('user/addAddress', payload);
    }

    this.setData({ saving: false });

    if (result && result.code === 0) {
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },
});
