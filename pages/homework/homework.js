const api = require('../../utils/api.js');
const format = require('../../utils/format.js');

Page({
  data: {
    currentFilter: 'all',
    homeworkList: [],
    filteredHomework: []
  },

  onLoad() {
    this.loadHomework();
  },

  onShow() {
    this.loadHomework();
  },

  async loadHomework() {
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;

    if (!currentStudent) {
      this.setData({ homeworkList: [], filteredHomework: [] });
      return;
    }

    try {
      const homeworkList = await api.get('/students/' + currentStudent.id + '/homework');

      const list = (homeworkList || []).map(item => ({
        ...item,
        deadlineText: '',
        submitTime: item.submit_time ? format.formatDateTime(item.submit_time) : '',
        score: item.score || null,
        submitStatus: item.score ? 'graded' : (item.submit_time ? 'submitted' : 'pending')
      }));

      this.setData({ homeworkList: list });
      this.filterHomework();
    } catch (err) {
      this.setData({ homeworkList: [], filteredHomework: [] });
    }
  },

  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.filterHomework();
  },

  filterHomework() {
    const { currentFilter, homeworkList } = this.data;
    let filtered = homeworkList;

    if (currentFilter !== 'all') {
      filtered = homeworkList.filter(h => h.submitStatus === currentFilter);
    }

    this.setData({ filteredHomework: filtered });
  },

  viewHomework(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/homework-detail/homework-detail?id=${id}`
    });
  }
});
