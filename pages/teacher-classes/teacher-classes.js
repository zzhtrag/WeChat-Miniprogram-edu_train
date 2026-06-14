const api = require('../../utils/api.js');

Page({
  data: {
    activeTab: 0,
    tabs: ['我的班级', '班级学员'],
    teacherClasses: [],
    classStudents: [],
    selectedClassId: null
  },

  onLoad() {
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
      const teacher = await api.get('/teachers/user/' + (userInfo?.id || ''));
      if (!teacher) return;

      const teacherClasses = await api.get('/teachers/' + teacher.id + '/classes');
      const selectedClassId = teacherClasses[0]?.id;

      let classStudents = [];
      if (selectedClassId) {
        classStudents = await api.get('/classes/' + selectedClassId + '/students');
      }

      this.setData({
        teacherClasses,
        classStudents,
        selectedClassId
      });
    } catch (err) {
    }
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index
    });
  },

  selectClass(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedClassId: id,
      activeTab: 1
    });
  },

  viewStudent(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '查看学生详情',
      icon: 'none'
    });
  },

  contactStudent(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '联系学生',
      icon: 'none'
    });
  }
});
