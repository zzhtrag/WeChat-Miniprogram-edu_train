Page({
  data: {
    notificationEnabled: true,
    cacheSize: '0KB'
  },

  onLoad() {
    this.loadSettings();
    this.calcCacheSize();
  },

  loadSettings() {
    const notificationEnabled = wx.getStorageSync('notificationEnabled');
    if (notificationEnabled !== '') {
      this.setData({ notificationEnabled });
    }
  },

  toggleNotification(e) {
    const enabled = e.detail.value;
    this.setData({ notificationEnabled: enabled });
    wx.setStorageSync('notificationEnabled', enabled);
  },

  calcCacheSize() {
    try {
      const res = wx.getStorageInfoSync();
      const sizeKB = res.currentSize;
      if (sizeKB < 1024) {
        this.setData({ cacheSize: sizeKB + 'KB' });
      } else {
        this.setData({ cacheSize: (sizeKB / 1024).toFixed(1) + 'MB' });
      }
    } catch (e) {
      this.setData({ cacheSize: '0KB' });
    }
  },

  clearCache() {
    wx.showModal({
      title: '确认清除',
      content: '清除缓存后需要重新登录，确定继续吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const token = app.globalData.token;
          const userInfo = app.globalData.userInfo;
          wx.clearStorageSync();
          if (token) wx.setStorageSync('token', token);
          if (userInfo) wx.setStorageSync('userInfo', userInfo);
          this.calcCacheSize();
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      }
    });
  },

  viewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护。本应用仅收集必要的用户信息用于教学管理，不会将您的信息分享给第三方。详细隐私政策请查看官网。',
      showCancel: false
    });
  },

  viewUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '使用本应用即表示您同意我们的服务条款。本应用为教育培训管理工具，用户应确保提交的信息真实有效。',
      showCancel: false
    });
  },

  about() {
    wx.showModal({
      title: '关于我们',
      content: 'EduTrain 教育培训 v1.0.0\n让学习更高效',
      showCancel: false
    });
  }
});
