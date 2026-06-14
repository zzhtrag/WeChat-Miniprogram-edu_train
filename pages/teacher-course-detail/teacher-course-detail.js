const api = require('../../utils/api.js');

Page({
  data: {
    courseInfo: null,
    classes: [],
    schedules: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.courseId = options.id;
      this.loadData();
    }
  },

  async loadData() {
    try {
      const courseInfo = await api.get('/courses/' + this.courseId);
      if (!courseInfo) {
        wx.showToast({ title: '课程不存在', icon: 'none' });
        return;
      }

      const app = getApp();
      const userInfo = app.globalData.userInfo;
      const teacher = await api.get('/teachers/user/' + (userInfo?.id || ''));
      const teacherId = teacher?.id;

      const allClasses = teacherId ? await api.get('/teachers/' + teacherId + '/classes') : [];
      const filteredClasses = allClasses.filter(c => c.course_id === this.courseId);
      const classes = [];
      for (const c of filteredClasses) {
        const students = await api.get('/classes/' + c.id + '/students');
        classes.push({ ...c, studentCount: students.length });
      }

      const schedules = [];
      for (const c of classes) {
        const classSchedules = await api.get('/schedules', { class_id: c.id });
        classSchedules.forEach(s => {
          schedules.push({ ...s, class_name: c.name });
        });
      }
      schedules.sort((a, b) => b.date.localeCompare(a.date));

      this.setData({
        courseInfo,
        classes,
        schedules,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  viewClass(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-class-detail/teacher-class-detail?id=${id}`
    });
  }
});
