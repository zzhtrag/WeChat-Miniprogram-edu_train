const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    student_name: '',
    age: '',
    gender: 'male',
    subject: '',
    parent_name: '',
    parent_phone: '',
    genderOptions: ['male', 'female'],
    genderLabels: ['男', '女'],
    genderIndex: 0,
    subjectOptions: config.subjects,
    subjectIndex: -1,
    submitting: false,
    showResult: false,
    regCode: '',
    regExpire: ''
  },

  onLoad() {},

  onLogoTap() {
    wx.navigateTo({ url: '/pages/school-home/school-home' });
  },

  onStudentNameInput(e) {
    this.setData({ student_name: e.detail.value });
  },

  onAgeInput(e) {
    this.setData({ age: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ genderIndex: e.detail.value, gender: this.data.genderOptions[e.detail.value] });
  },

  onSubjectChange(e) {
    this.setData({ subjectIndex: e.detail.value, subject: this.data.subjectOptions[e.detail.value] });
  },

  onParentNameInput(e) {
    this.setData({ parent_name: e.detail.value });
  },

  onParentPhoneInput(e) {
    this.setData({ parent_phone: e.detail.value });
  },

  async submit() {
    const { student_name, age, gender, subject, parent_name, parent_phone } = this.data;

    if (!student_name.trim()) {
      wx.showToast({ title: '请输入学生姓名', icon: 'none' });
      return;
    }
    if (!age) {
      wx.showToast({ title: '请输入年龄', icon: 'none' });
      return;
    }
    if (!subject) {
      wx.showToast({ title: '请选择报名学科', icon: 'none' });
      return;
    }
    if (!parent_name.trim()) {
      wx.showToast({ title: '请输入家长姓名', icon: 'none' });
      return;
    }
    if (!parent_phone || parent_phone.length < 11) {
      wx.showToast({ title: '请输入正确的家长电话', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      const reg = await api.post('/registrations', {
        student_name: student_name.trim(),
        age: parseInt(age),
        gender,
        subject,
        parent_name: parent_name.trim(),
        parent_phone: parent_phone.trim()
      });

      this.setData({
        submitting: false,
        showResult: true,
        regCode: reg.code,
        regExpire: reg.expire_time
      });
    } catch (err) {
      this.setData({ submitting: false });
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    }
  },

  copyCode() {
    wx.setClipboardData({
      data: this.data.regCode,
      success: () => {
        wx.showToast({ title: '报名码已复制', icon: 'success' });
      }
    });
  },

  goToEnrollmentStatus() {
    wx.navigateTo({ url: '/pages/enrollment-status/enrollment-status' });
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  }
});
