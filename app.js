const config = require('./config.js');
const api = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    token: null,
    config: config,
    currentStudent: null
  },

  onLaunch() {
    this.checkLoginStatus();
  },

  onShow() {
  },

  onHide() {
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const currentStudent = wx.getStorageSync('currentStudent');
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      if (currentStudent) {
        this.globalData.currentStudent = currentStudent;
      }
    }
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  setToken(token) {
    this.globalData.token = token;
    wx.setStorageSync('token', token);
  },

  setCurrentStudent(student) {
    this.globalData.currentStudent = student;
    wx.setStorageSync('currentStudent', student);
  },

  logout() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.currentStudent = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('currentStudent');
    wx.reLaunch({
      url: '/pages/login/login'
    });
  },

  // 根据角色跳转到对应首页
  redirectToHome() {
    const userInfo = this.globalData.userInfo;
    if (!userInfo) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }

    switch (userInfo.role) {
      case 'admin':
        wx.reLaunch({
          url: '/pages/admin-index/admin-index'
        });
        break;
      case 'teacher':
        wx.reLaunch({
          url: '/pages/teacher-index/teacher-index'
        });
        break;
      case 'parent':
        wx.reLaunch({
          url: '/pages/parent-index/parent-index'
        });
        break;
      default:
        wx.reLaunch({
          url: '/pages/login/login'
        });
    }
  }
});
