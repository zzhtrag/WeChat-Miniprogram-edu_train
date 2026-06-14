const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: {},
    currentStudent: null,
    unreadCount: 1,
    pointsBalance: 0
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    this.loadUserData();
  },

  async loadUserData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || {};
    const currentStudent = app.globalData.currentStudent;

    this.setData({ userInfo, currentStudent });

    // Load points balance
    if (userInfo.role === 'parent') {
      try {
        const parents = await api.get('/parents', { user_id: userInfo.id });
        if (parents && parents.length > 0) {
          const pointsInfo = await api.get('/gift-points', { parent_id: parents[0].id });
          this.setData({ pointsBalance: pointsInfo ? pointsInfo.balance : 0 });
        }
      } catch (err) {}
    }
  },

  editProfile() {
    wx.showToast({
      title: '编辑资料',
      icon: 'none'
    });
  },

  goToMenu(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
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
