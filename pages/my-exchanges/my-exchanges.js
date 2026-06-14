const api = require('../../utils/api.js');

const STATUS_MAP = {
  pending: { label: '待确认', color: 'warning' },
  confirmed: { label: '已确认', color: 'primary' },
  shipped: { label: '已发货', color: 'info' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'muted' }
};

Page({
  data: {
    orders: [],
    filterStatus: '',
    statusMap: STATUS_MAP,
    loading: true,
    parentId: null
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
      let parentId = this.data.parentId;
      if (!parentId && userInfo) {
        const parents = await api.get('/parents', { user_id: userInfo.id });
        if (parents && parents.length > 0) {
          parentId = parents[0].id;
        }
      }

      if (!parentId) {
        this.setData({ loading: false });
        return;
      }

      const orders = await api.get('/exchange-orders', {
        parent_id: parentId,
        status: this.data.filterStatus
      });

      this.setData({ orders, parentId, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  setFilterStatus(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status });
    this.loadData();
  },

  cancelOrder(e) {
    const id = e.currentTarget.dataset.id;
    const that = this;
    wx.showModal({
      title: '确认取消',
      content: '取消后积分将退还到您的账户，确定取消吗？',
      async success(res) {
        if (res.confirm) {
          try {
            await api.put('/exchange-orders/' + id + '/status', { status: 'cancelled' });
            wx.showToast({ title: '已取消，积分已退还', icon: 'success' });
            that.loadData();
          } catch (err) {
            wx.showToast({ title: '取消失败', icon: 'none' });
          }
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});
