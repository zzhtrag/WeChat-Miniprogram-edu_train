const api = require('../../utils/api.js');

Page({
  data: {
    messages: [],
    unreadCount: 0,
    loading: false,
    currentTab: 'all'
  },

  onLoad() {
    this.loadMessages();
  },

  onShow() {
    this.loadMessages();
  },

  onPullDownRefresh() {
    this.loadMessages();
    setTimeout(() => wx.stopPullDownRefresh(), 500);
  },

  async loadMessages() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (!userInfo) return;

    this.setData({ loading: true });

    try {
      const messages = await api.get('/messages');
      const unreadCount = messages.filter(m => !m.is_read).length;

      this.setData({
        messages: messages,
        unreadCount: unreadCount,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  async viewMessage(e) {
    const id = e.currentTarget.dataset.id;
    const message = this.data.messages.find(m => m.id === id);
    if (!message) return;

    try {
      await api.put('/messages/' + id + '/read');
      message.is_read = true;
    } catch (err) {
      wx.showToast({ title: '标记失败', icon: 'none' });
    }

    this.setData({ loading: true });
    this.loadMessages();

    wx.showModal({
      title: message.title,
      content: message.content,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  async markAllRead() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (!userInfo) return;

    try {
      await api.put('/messages/read-all');
      this.loadMessages();

      wx.showToast({
        title: '已全部标记为已读',
        icon: 'success'
      });
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
