const api = require('../../utils/api.js');

Page({
  data: {
    tabs: ['推荐', 'n007', 'n006', 'n006', 'n005', 'n004'],
    activeTab: 0,
    courses: [],
    filteredCourses: [],
    currentStudent: null
  },

  onLoad() {
    this.loadCourses();
    this.loadStudentData();
  },

  onShow() {
    this.loadStudentData();
  },

  loadStudentData() {
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;
    this.setData({ currentStudent });
  },

  async loadCourses() {
    try {
      const [courses, teachers] = await Promise.all([
        api.get('/courses'),
        api.get('/teachers')
      ]);

      const courseList = (courses || []).map(course => {
        const teacher = (teachers || []).find(t => t.id === course.teacher_id);
        return {
          ...course,
          teacherName: teacher ? teacher.name : '未知教师',
          teacherAvatar: teacher ? teacher.avatar : '',
          remaining: course.capacity - course.current_students
        };
      });

      this.setData({
        courses: courseList,
        filteredCourses: [] // 默认显示空状态
      });
    } catch (err) {
    }
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });

    if (index === 0) {
      this.setData({ filteredCourses: [] });
    } else {
      this.setData({ filteredCourses: this.data.courses });
    }
  },

  showMoreTabs() {
    wx.showToast({
      title: '更多分类',
      icon: 'none'
    });
  },

  viewCourseDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    });
  },

  enrollCourse(e) {
    const course = e.currentTarget.dataset.course;
    if (course.remaining <= 0) {
      wx.showToast({
        title: '课程已满',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认报名',
      content: `确定要报名《${course.name}》吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          });
        }
      }
    });
  }
});
