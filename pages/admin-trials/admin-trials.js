const api = require('../../utils/api.js');

Page({
  data: {
    registrations: [],
    filterStatus: '',
    statusTabs: [
      { key: '', label: '全部' },
      { key: 'pending', label: '待处理' },
      { key: 'confirmed', label: '已确认' },
      { key: 'trial', label: '已试听' },
      { key: 'enrolled', label: '已报名' }
    ],
    stats: {
      total: 0,
      pending: 0,
      confirmed: 0,
      trial: 0,
      enrolled: 0
    },
    loading: false
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
    this.setData({ loading: true });
    try {
      const params = { type: 'trial' };
      if (this.data.filterStatus) {
        params.status = this.data.filterStatus;
      }
      const items = await api.get('/registrations', params);
      const allItems = await api.get('/registrations', { type: 'trial' });

      const stats = {
        total: allItems.length,
        pending: allItems.filter(r => r.status === 'pending').length,
        confirmed: allItems.filter(r => r.status === 'confirmed').length,
        trial: allItems.filter(r => r.status === 'trial').length,
        enrolled: allItems.filter(r => r.status === 'enrolled').length
      };

      this.setData({ registrations: items || [], stats, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onTabTap(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ filterStatus: status }, () => this.loadData());
  },

  async updateStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const statusLabels = {
      confirmed: '确认',
      trial: '试听完成',
      enrolled: '报名'
    };

    wx.showActionSheet({
      itemList: Object.entries(statusLabels).filter(([k]) => k !== status).map(([, v]) => `标记为${v}`),
      success: async (res) => {
        const nextStatuses = Object.entries(statusLabels).filter(([k]) => k !== status).map(([k]) => k);
        const nextStatus = nextStatuses[res.tapIndex];
        if (!nextStatus) return;
        try {
          await api.put(`/registrations/${id}/status`, { status: nextStatus });
          wx.showToast({ title: '操作成功', icon: 'success' });
          this.loadData();
        } catch (err) {
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  callPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) wx.makePhoneCall({ phoneNumber: phone });
  }
});
