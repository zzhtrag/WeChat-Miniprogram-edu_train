const api = require('../../utils/api.js');

Page({
  data: {
    gifts: [],
    pointsBalance: 0,
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const gifts = await api.get('/gifts', { status: 'on_shelf' });
      let pointsBalance = 0;

      if (userInfo && userInfo.role === 'parent') {
        const parents = await api.get('/parents', { user_id: userInfo.id });
        if (parents && parents.length > 0) {
          const pointsInfo = await api.get('/gift-points', { parent_id: parents[0].id });
          pointsBalance = pointsInfo ? pointsInfo.balance : 0;
        }
      }

      this.setData({ gifts, pointsBalance, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/gift-detail/gift-detail?id=' + id });
  },

  goToMyExchanges() {
    wx.navigateTo({ url: '/pages/my-exchanges/my-exchanges' });
  },

  onShareAppMessage() {
    return {
      title: '来礼品商城兑换好礼！',
      path: '/pages/gift-shop/gift-shop'
    };
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});
