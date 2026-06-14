const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: {},
    studyStats: {},
    teacherStats: {},
    unreadCount: 3
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },

  async loadData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    this.setData({ userInfo: userInfo || {} });

    try {
      if (userInfo) {
        // 根据角色加载统计信息
        if (userInfo.role === 'teacher') {
          const teacher = await api.get('/teachers/user/' + userInfo.id);
          if (teacher) {
            const stats = await api.get('/teachers/' + teacher.id + '/stats');
            this.setData({ teacherStats: stats || {} });
          }
        }
      }
    } catch (err) {
    }
  },

  editProfile() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  viewMyCourses() {
    wx.switchTab({
      url: '/pages/courses/courses'
    });
  },

  viewMyHomework() {
    wx.switchTab({
      url: '/pages/homework/homework'
    });
  },

  viewStudyHours() {
    wx.navigateTo({
      url: '/pages/progress/progress'
    });
  },

  goToPage(e) {
    const url = e.currentTarget.dataset.url;
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    // 教师端页面直接跳转
    if (url.includes('teacher-')) {
      wx.navigateTo({ url });
      return;
    }

    // 学生端 tabBar 页面
    if (url.includes('pages/courses') || url.includes('pages/homework')) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({ url });
    }
  },

  viewMySchedule() {
    wx.switchTab({
      url: '/pages/timetable/timetable'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  viewHelp() {
    wx.showModal({
      title: '帮助与反馈',
      content: '如有问题请联系客服：400-888-8888',
      showCancel: false
    });
  },

  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '培训机构小程序 v1.0.0\n让学习更高效',
      showCancel: false
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.logout();
        }
      }
    });
  }
});
