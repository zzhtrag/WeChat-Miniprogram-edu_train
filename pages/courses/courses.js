const api = require('../../utils/api.js');

Page({
  data: {
    banners: [],
    courseCategories: [],
    subjectCategories: [],
    selectedSubject: '',
    sortType: 'default', // default, newest, hot, price
    courseType: 'all', // all, video, article, live
    searchKeyword: '',
    showFilter: false,
    courses: [],
    filteredCourses: []
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  async loadData() {
    try {
      const courses = await api.get('/courses');

      this.setData({
        courses: courses || []
      });
      this.filterCourses();
    } catch (err) {
    }
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch() {
    this.filterCourses();
  },

  selectSubject(e) {
    const subject = e.currentTarget.dataset.subject;
    this.setData({
      selectedSubject: this.data.selectedSubject === subject ? '' : subject
    });
    this.filterCourses();
  },

  selectCourseType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ courseType: type });
    this.filterCourses();
  },

  selectSortType(e) {
    const sortType = e.currentTarget.dataset.sort;
    this.setData({ sortType });
    this.filterCourses();
  },

  toggleFilter() {
    this.setData({
      showFilter: !this.data.showFilter
    });
  },

  filterCourses() {
    let { courses, selectedSubject, courseType, searchKeyword, sortType } = this.data;
    let filtered = [...courses];

    // 按科目筛选
    if (selectedSubject) {
      filtered = filtered.filter(c => c.subject === selectedSubject);
    }

    // 按课程类型筛选（后端无type字段，此筛选暂不生效）
    if (courseType !== 'all') {
      // 暂不过滤，后端 CourseOut 无 type 字段
    }

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(c =>
        c.name.includes(searchKeyword) ||
        (c.subject && c.subject.includes(searchKeyword))
      );
    }

    // 排序
    if (sortType === 'newest') {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortType === 'hot') {
      filtered.sort((a, b) => (b.student_count || 0) - (a.student_count || 0));
    } else if (sortType === 'price') {
      // 后端无 price 字段，暂不排序
    }

    this.setData({ filteredCourses: filtered });
  },

  viewCourse(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    });
  },

  viewBanner(e) {
    wx.showToast({
      title: '查看广告详情',
      icon: 'none'
    });
  }
});
