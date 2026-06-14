const api = require('../../utils/api.js');

Page({
  data: {
    timelineGroups: [],
    currentStudent: null,
    showFeaturedOnly: false,
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 800);
  },

  async loadData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const parents = await api.get('/parents', { user_id: userInfo?.id });
      const parent = parents && parents.length > 0 ? parents[0] : null;
      if (!parent) {
        this.setData({ loading: false });
        return;
      }

      const currentStudentId = app.globalData.currentStudentId;
      const students = await api.get('/students', { parent_id: parent.id });
      const currentStudent = currentStudentId
        ? students.find(s => s.id === currentStudentId) || students[0]
        : students[0];

      if (!currentStudent) {
        this.setData({ loading: false });
        return;
      }

      let items = await api.get('/portfolios', { student_id: currentStudent.id, status: 'active' });
      if (this.data.showFeaturedOnly) {
        items = items.filter(i => i.is_featured || i.is_excellent);
      }

      const timelineGroups = this.groupByMonth(items);
      const summary = await api.get('/students/' + currentStudent.id + '/portfolio-summary');

      this.setData({
        currentStudent,
        timelineGroups,
        summary,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  groupByMonth(items) {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.work_date);
      const key = date.getFullYear() + '年' + (date.getMonth() + 1) + '月';
      if (!groups[key]) groups[key] = { month: key, items: [] };
      groups[key].items.push(item);
    });
    return Object.values(groups).sort((a, b) => a.month > b.month ? -1 : 1);
  },

  toggleFeaturedFilter() {
    this.setData({ showFeaturedOnly: !this.data.showFeaturedOnly }, () => this.loadData());
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/parent-portfolio-detail/parent-portfolio-detail?id=' + id });
  }
});
