const api = require('../../utils/api.js');

Page({
  data: {
    keyword: '',
    gifts: [],
    giftStats: {
      total: 0,
      on_shelf: 0,
      off_shelf: 0
    },
    filterStatus: '',
    showActionSheet: false,
    currentGift: null
  },

  onLoad() {
    this.loadGifts();
  },

  onShow() {
    this.loadGifts();
  },

  async loadGifts() {
    const gifts = await api.get('/gifts', {
      keyword: this.data.keyword,
      status: this.data.filterStatus
    });
    const allGifts = await api.get('/gifts');
    const stats = {
      total: allGifts.length,
      on_shelf: allGifts.filter(g => g.status === 'on_shelf').length,
      off_shelf: allGifts.filter(g => g.status === 'off_shelf').length
    };
    this.setData({ gifts, giftStats: stats });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadGifts();
  },

  clearSearch() {
    this.setData({ keyword: '' });
    this.loadGifts();
  },

  setFilterStatus(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status });
    this.loadGifts();
  },

  showActions(e) {
    const giftId = e.currentTarget.dataset.id;
    const giftItem = this.data.gifts.find(g => g.id === giftId);
    this.setData({ showActionSheet: true, currentGift: giftItem });
  },

  hideActionSheet() {
    this.setData({ showActionSheet: false, currentGift: null });
  },

  editGift() {
    const { currentGift } = this.data;
    this.hideActionSheet();
    wx.navigateTo({
      url: '/pages/admin-gift-edit/admin-gift-edit?id=' + currentGift.id
    });
  },

  async toggleGiftStatus() {
    const { currentGift } = this.data;
    const newStatus = currentGift.status === 'on_shelf' ? 'off_shelf' : 'on_shelf';
    try {
      await api.put('/gifts/' + currentGift.id, { status: newStatus });
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.hideActionSheet();
      this.loadGifts();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteGift() {
    const { currentGift } = this.data;
    const that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除礼品"' + currentGift.name + '"吗？删除后不可恢复。',
      confirmColor: '#ff4d4f',
      async success(res) {
        if (res.confirm) {
          try {
            await api.delete('/gifts/' + currentGift.id);
            wx.showToast({ title: '删除成功', icon: 'success' });
            that.hideActionSheet();
            that.loadGifts();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  addGift() {
    wx.navigateTo({
      url: '/pages/admin-gift-edit/admin-gift-edit'
    });
  },

  onPullDownRefresh() {
    this.loadGifts();
    wx.stopPullDownRefresh();
  }
});
