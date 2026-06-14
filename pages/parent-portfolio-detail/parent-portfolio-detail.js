const api = require('../../utils/api.js');
const sharePoints = require('../../utils/share-points.js');

Page({
  data: {
    item: null,
    loading: true,
    shareId: '',
    hasShared: false
  },

  onLoad(options) {
    sharePoints.trackShareVisit(options);

    if (options.id) {
      this.itemId = options.id;
      this.loadData();
    }
  },

  async loadData() {
    try {
      const item = await api.get('/portfolios/' + this.itemId);
      this.setData({ item, loading: false });
      this.checkShareStatus();
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  async checkShareStatus() {
    const app = getApp();
    if (!app.globalData.userInfo || app.globalData.userInfo.role !== 'parent') return;

    const parentId = await sharePoints.getParentId();
    if (!parentId) return;

    const basePath = '/pages/parent-portfolio-detail/parent-portfolio-detail?id=' + this.itemId;
    const record = await api.get('/share-records', { parent_id: parentId, page_type: 'portfolio', page_path: basePath });
    if (record) {
      this.setData({ hasShared: true, shareId: record.share_id || '' });
      wx.hideShareMenu();
    }
  },

  async prepareShareId() {
    const app = getApp();
    if (!app.globalData.userInfo || app.globalData.userInfo.role !== 'parent') return;

    const parentId = await sharePoints.getParentId();
    if (!parentId) return;

    const basePath = '/pages/parent-portfolio-detail/parent-portfolio-detail?id=' + this.itemId;
    const record = await sharePoints.createShareRecord(parentId, 'portfolio', basePath);
    if (record && record.share_id) {
      this.setData({ shareId: record.share_id, hasShared: true });
      wx.hideShareMenu();
    }
  },

  shareToMoments() {
    if (this.data.hasShared) return;
    wx.showModal({
      title: '分享到朋友圈',
      content: '请点击右上角「···」按钮，选择「分享到朋友圈」',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#4F46E5'
    });
  },

  onShareAppMessage() {
    const { item } = this.data;
    if (!item) return {};

    this.prepareShareId();

    const studentName = item.student_name || '学生';
    let query = 'id=' + this.itemId;
    if (this.data.shareId) query += '&shareId=' + this.data.shareId;
    return {
      title: '来看看' + studentName + '的优秀作品「' + item.title + '」！',
      path: '/pages/parent-portfolio-detail/parent-portfolio-detail?' + query,
      imageUrl: item.file_url || ''
    };
  },

  onShareTimeline() {
    const { item } = this.data;
    if (!item) return {};

    this.prepareShareId();

    const studentName = item.student_name || '学生';
    let query = 'id=' + this.itemId;
    if (this.data.shareId) query += '&shareId=' + this.data.shareId;
    return {
      title: studentName + '的优秀作品「' + item.title + '」— ' + (item.category_label || '作品展示'),
      query: query,
      imageUrl: item.file_url || ''
    };
  },

  previewImage() {
    const { item } = this.data;
    if (!item || !item.file_url) return;
    wx.previewImage({
      urls: [item.file_url],
      current: item.file_url
    });
  }
});
