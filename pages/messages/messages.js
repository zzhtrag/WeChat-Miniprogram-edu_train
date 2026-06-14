const api = require('../../utils/api.js');

Page({
  data: {
    currentStudent: null,
    announcements: [],
    unreadCount: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 1000);
  },

  async loadData() {
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;
    const userInfo = app.globalData.userInfo;

    try {
      // 获取公告列表（家长可见的公告：system 和 parent 类型）
      const announcementsData = await api.get('/announcements', {
        status: 'published',
        type: 'system,parent,all'
      });
      const users = await api.get('/users');

      let announcements = announcementsData.filter(a =>
        a.status === 'published' &&
        (a.type === 'system' || a.type === 'parent' || a.type === 'all')
      ).map(a => {
        // 获取发布者信息
        const publisher = users.find(u => u.id === a.publisher_id);
        return {
          id: a.id,
          title: a.title,
          content: a.content,
          type: a.type,
          isPinned: a.is_pinned,
          publishTime: a.created_at?.split(' ')[0] || '',
          publisherName: publisher?.name || '系统',
          isRead: false
        };
      });

      // 按是否置顶和发布时间排序
      announcements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.publishTime) - new Date(a.publishTime);
      });

      const unreadCount = announcements.filter(a => !a.isRead).length;

      this.setData({
        currentStudent,
        announcements,
        unreadCount
      });
    } catch (err) {
      this.setData({
        currentStudent,
        announcements: [],
        unreadCount: 0
      });
    }
  },

  viewAnnouncement(e) {
    const id = e.currentTarget.dataset.id;
    const announcement = this.data.announcements.find(a => a.id === id);

    // 标记为已读
    if (announcement && !announcement.isRead) {
      announcement.isRead = true;
      this.setData({
        announcements: this.data.announcements,
        unreadCount: this.data.unreadCount - 1
      });
    }

    // 显示详情
    wx.showModal({
      title: announcement.title,
      content: announcement.content,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  getTypeName(type) {
    const typeMap = {
      'system': '系统通知',
      'parent': '家长通知',
      'all': '全体通知'
    };
    return typeMap[type] || '通知';
  },

  getTypeClass(type) {
    const classMap = {
      'system': 'type-system',
      'parent': 'type-parent',
      'all': 'type-all'
    };
    return classMap[type] || 'type-system';
  }
});
