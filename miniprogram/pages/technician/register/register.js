const util = require('../../../utils/util');
const callCloud = util.callCloud;
const isValidPhone = util.isValidPhone;
const APPLIANCE_TYPES = util.APPLIANCE_TYPES;

Page({
  data: {
    skills: APPLIANCE_TYPES,
    selectedSkillMap: {},
    selectedSkills: [],
    realName: '',
    phone: '',
    serviceArea: '',
    submitting: false,
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const update = {};
    update[field] = e.detail.value;
    this.setData(update);
  },

  toggleSkill(e) {
    const skill = e.currentTarget.dataset.skill;
    const selectedSkillMap = Object.assign({}, this.data.selectedSkillMap);
    selectedSkillMap[skill] = !selectedSkillMap[skill];

    const selectedSkills = this.data.skills.filter(function (item) {
      return selectedSkillMap[item];
    });

    this.setData({
      selectedSkillMap: selectedSkillMap,
      selectedSkills: selectedSkills,
    });
  },

  async onSubmit() {
    const realName = this.data.realName;
    const phone = this.data.phone;
    const serviceArea = this.data.serviceArea;
    const selectedSkills = this.data.selectedSkills;

    if (!realName.trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }
    if (!isValidPhone(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (selectedSkills.length === 0) {
      wx.showToast({ title: '请选择至少一项技能', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    const result = await callCloud('technician/register', {
      realName: realName,
      phone: phone,
      serviceArea: serviceArea,
      skills: selectedSkills,
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(function () {
        wx.navigateBack();
      }, 1500);
    }
    this.setData({ submitting: false });
  },
});
