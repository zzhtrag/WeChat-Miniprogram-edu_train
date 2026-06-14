const api = require('../../utils/api.js');

Page({
  data: {
    teacherInfo: {},
    classCount: 0,
    studentCount: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  async loadData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const teacherDetail = await api.get('/teachers/user/' + (userInfo?.id || ''));
      if (!teacherDetail) return;

      const classes = await api.get('/teachers/' + teacherDetail.id + '/classes');
      const students = await api.get('/teachers/' + teacherDetail.id + '/students');

      this.setData({
        teacherInfo: {
          ...teacherDetail,
          subjectsDisplay: teacherDetail.subjects?.join('、') || ''
        },
        classCount: classes.length,
        studentCount: students.length
      });
    } catch (err) {
    }
  },

  editProfile() {
    if (this.data.teacherInfo?.id) {
      wx.navigateTo({
        url: '/pages/admin-teacher-edit/admin-teacher-edit?id=' + this.data.teacherInfo.id
      });
    }
  },

  changePassword() {
    wx.showToast({
      title: '请联系管理员修改密码',
      icon: 'none'
    });
  }
});
