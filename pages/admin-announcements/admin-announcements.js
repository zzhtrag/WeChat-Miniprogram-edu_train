// pages/admin-announcements/admin-announcements.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    // 公告列表
    announcements: [],
    // 统计数据
    stats: {
      total: 0,
      published: 0,
      draft: 0,
      expired: 0
    },
    // 筛选状态
    filterType: 'all',
    filterStatus: 'all',
    keyword: '',
    // 加载状态
    loading: false,
    // 空状态
    isEmpty: false
  },

  onLoad(options) {
    this.loadAnnouncements();
  },

  onShow() {
    this.loadAnnouncements();
  },

  async loadAnnouncements() {
    this.setData({ loading: true });

    try {
      const params = {};
      if (this.data.filterType !== 'all') params.type = this.data.filterType;
      if (this.data.filterStatus !== 'all') params.status = this.data.filterStatus;
      if (this.data.keyword) params.keyword = this.data.keyword;

      const list = await api.get('/announcements', params);

      const allAnnouncements = await api.get('/announcements');
      const stats = {
        total: allAnnouncements.length,
        published: allAnnouncements.filter(a => a.status === 'active').length,
        draft: allAnnouncements.filter(a => a.status === 'draft').length,
        expired: allAnnouncements.filter(a => a.status === 'expired').length
      };

      this.setData({
        announcements: list,
        stats: stats,
        isEmpty: list.length === 0,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onPullDownRefresh() {
    this.loadAnnouncements();
    wx.stopPullDownRefresh();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadAnnouncements();
  },

  onFilterType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type });
    this.loadAnnouncements();
  },

  onFilterStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ filterStatus: status });
    this.loadAnnouncements();
  },

  onAddAnnouncement() {
    wx.navigateTo({
      url: '/pages/admin-announcement-edit/admin-announcement-edit'
    });
  },

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-announcement-edit/admin-announcement-edit?id=${id}`
    });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    const title = e.currentTarget.dataset.title;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除公告"${title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doDelete(id);
        }
      }
    });
  },

  async doDelete(id) {
    try {
      await api.delete('/announcements/' + id);
      wx.showToast({ title: '删除成功', icon: 'success' });
      this.loadAnnouncements();
    } catch (err) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  async onTogglePin(e) {
    const id = e.currentTarget.dataset.id;
    const isPinned = e.currentTarget.dataset.pinned;

    try {
      await api.put('/announcements/' + id + '/pin');
      wx.showToast({
        title: isPinned ? '已取消置顶' : '已置顶',
        icon: 'success'
      });
      this.loadAnnouncements();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async onTogglePublish(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const newStatus = status === 'active' ? 'draft' : 'active';

    try {
      await api.put('/announcements/' + id, { status: newStatus });
      wx.showToast({
        title: newStatus === 'active' ? '已发布' : '已撤回',
        icon: 'success'
      });
      this.loadAnnouncements();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
