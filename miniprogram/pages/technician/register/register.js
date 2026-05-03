const { callCloud } = require('../../../utils/util');

Page({
  data: {
    skills: ['空调', '冰箱', '洗衣机', '热水器', '电视', '油烟机', '燃气灶', '微波炉', '电磁炉'],
    selectedSkills: [],
    realName: '',
    phone: '',
    serviceArea: '',
    submitting: false,
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  toggleSkill(e) {
    const skill = e.currentTarget.dataset.skill;
    let { selectedSkills } = this.data;
    if (selectedSkills.includes(skill)) {
      selectedSkills = selectedSkills.filter(s => s !== skill);
    } else {
      selectedSkills.push(skill);
    }
    this.setData({ selectedSkills });
  },

  async onSubmit() {
    const { realName, phone, serviceArea, selectedSkills } = this.data;
    if (!realName.trim()) { wx.showToast({ title: '请填写姓名', icon: 'none' }); return; }
    if (!phone.trim()) { wx.showToast({ title: '请填写电话', icon: 'none' }); return; }
    if (selectedSkills.length === 0) { wx.showToast({ title: '请选择至少一项技能', icon: 'none' }); return; }

    this.setData({ submitting: true });
    const result = await callCloud('technician/register', {
      realName, phone, serviceArea, skills: selectedSkills,
    });
    if (result && result.code === 0) {
      wx.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
    this.setData({ submitting: false });
  },
});
