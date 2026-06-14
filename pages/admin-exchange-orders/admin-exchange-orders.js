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
    parentMap: {}
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    const orders = await api.get('/exchange-orders', {
      status: this.data.filterStatus
    });
    const allOrders = await api.get('/exchange-orders');
    const parents = await api.get('/parents');
    const parentMap = {};
    parents.forEach(p => { parentMap[p.id] = p.name; });

    this.setData({ orders, parentMap });
  },

  setFilterStatus(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status });
    this.loadOrders();
  },

  async updateOrderStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const statusLabel = STATUS_MAP[status]?.label || status;
    wx.showModal({
      title: '确认操作',
      content: '确定要将订单状态更改为"' + statusLabel + '"吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put('/exchange-orders/' + id + '/status', { status });
            wx.showToast({ title: '状态更新成功', icon: 'success' });
            this.loadOrders();
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  }
});
