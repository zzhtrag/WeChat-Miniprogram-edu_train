const api = require('../../utils/api.js');

Page({
  data: {
    item: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.itemId = options.id;
      this.loadData();
    }
  },

  async loadData() {
    try {
      const item = await api.get('/portfolios/' + this.itemId);
      this.setData({ item, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  previewImage() {
    const { item } = this.data;
    if (!item || !item.file_url) return;
    wx.previewImage({
      urls: [item.file_url],
      current: item.file_url
    });
  },

  async toggleFeatured() {
    try {
      const result = await api.post('/portfolios/' + this.itemId + '/featured');
      if (result) {
        this.loadData();
        wx.showToast({
          title: result.is_featured ? '已设为精选' : '已取消精选',
          icon: 'success'
        });
      }
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async toggleExcellent() {
    try {
      const result = await api.post('/portfolios/' + this.itemId + '/excellent');
      if (result) {
        this.loadData();
        wx.showToast({
          title: result.is_excellent ? '已标记优秀' : '已取消优秀',
          icon: 'success'
        });
      }
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteItem() {
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这个作品吗？',
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.delete('/portfolios/' + this.itemId);
            if (result.success) {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 800);
            }
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
