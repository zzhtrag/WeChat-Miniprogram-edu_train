const api = require('../../utils/api.js');

Page({
  data: {
    keyword: '',
    courses: [],
    courseStats: {
      total: 0,
      active: 0,
      inactive: 0
    },
    filterStatus: '',
    showActionSheet: false,
    currentCourse: null
  },

  onLoad() {
    this.loadCourses();
  },

  onShow() {
    this.loadCourses();
  },

  async loadCourses() {
    const courses = await api.get('/courses', {
      keyword: this.data.keyword,
      status: this.data.filterStatus
    });
    const allCourses = await api.get('/courses');
    const stats = {
      total: allCourses.length,
      active: allCourses.filter(c => c.status === 'active').length,
      inactive: allCourses.filter(c => c.status === 'inactive').length
    };
    this.setData({ courses, courseStats: stats });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadCourses();
  },

  clearSearch() {
    this.setData({ keyword: '' });
    this.loadCourses();
  },

  setFilterStatus(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status });
    this.loadCourses();
  },

  showActions(e) {
    const courseId = e.currentTarget.dataset.id;
    const courseItem = this.data.courses.find(c => c.id === courseId);
    this.setData({ showActionSheet: true, currentCourse: courseItem });
  },

  hideActionSheet() {
    this.setData({ showActionSheet: false, currentCourse: null });
  },

  editCourse() {
    const { currentCourse } = this.data;
    this.hideActionSheet();
    wx.navigateTo({
      url: '/pages/admin-course-edit/admin-course-edit?id=' + currentCourse.id
    });
  },

  async toggleCourseStatus() {
    const { currentCourse } = this.data;
    const newStatus = currentCourse.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put('/courses/' + currentCourse.id + '/status', { status: newStatus });
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.hideActionSheet();
      this.loadCourses();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteCourse() {
    const { currentCourse } = this.data;
    const that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除课程"' + currentCourse.name + '"吗？删除后不可恢复。',
      confirmColor: '#ff4d4f',
      async success(res) {
        if (res.confirm) {
          try {
            await api.delete('/courses/' + currentCourse.id);
            wx.showToast({ title: '删除成功', icon: 'success' });
            that.hideActionSheet();
            that.loadCourses();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  addCourse() {
    wx.navigateTo({
      url: '/pages/admin-course-edit/admin-course-edit'
    });
  },

  onPullDownRefresh() {
    this.loadCourses();
    wx.stopPullDownRefresh();
  }
});
