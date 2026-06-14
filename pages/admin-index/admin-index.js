// pages/admin-index/admin-index.js
const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: {},
    stats: {},
    quickMenus: [
      { icon: '📖', iconFile: 'course', label: '课程管理', url: '/pages/admin-courses/admin-courses' },
      { icon: '👨‍🏫', iconFile: 'teacher', label: '教师管理', url: '/pages/admin-teachers/admin-teachers' },
      { icon: '👨‍🎓', iconFile: 'students', label: '学员管理', url: '/pages/admin-students/admin-students' },
      { icon: '📚', iconFile: 'class', label: '班级管理', url: '/pages/admin-classes/admin-classes' },
      { icon: '📋', iconFile: 'enrollment', label: '报名管理', url: '/pages/admin-enrollments/admin-enrollments' },
      { icon: '/svg/管理员-公告管理.svg', iconFile: 'announce', label: '公告管理', url: '/pages/admin-announcements/admin-announcements' },
      { icon: '/svg/管理员-数据统计.svg', iconFile: 'stats', label: '数据统计', url: '/pages/admin-stats/admin-stats' },
      { icon: '/svg/icon-gift.svg', iconFile: 'gift', label: '礼品管理', url: '/pages/admin-gifts/admin-gifts' },
      { icon: '/svg/icon-exchange-orders.svg', iconFile: 'exchange-orders', label: '兑换订单', url: '/pages/admin-exchange-orders/admin-exchange-orders' },
      { icon: '🏫', iconFile: 'school', label: '学校信息', url: '/pages/admin-school-profile/admin-school-profile' },
      { icon: '📋', iconFile: 'enrollment', label: '试学管理', url: '/pages/admin-trials/admin-trials' }
    ],
    recentNotices: []
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
    const stats = await api.get('/stats/admin');
    const regStats = await api.get('/registrations/stats');
    const announcements = await api.get('/announcements');
    const recentNotices = announcements.slice(0, 3);

    this.setData({
      userInfo,
      stats,
      regStats,
      recentNotices
    });
  },

  goToMenu(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  goToProfile() {
    // 管理员首页头像点击
  },

  viewNotice(e) {
    const id = e.currentTarget.dataset.id;
    const notice = this.data.recentNotices.find(n => n.id === id);
    if (notice) {
      wx.showModal({
        title: notice.title,
        content: notice.content,
        showCancel: false
      });
    }
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.logout();
        }
      }
    });
  },

});

