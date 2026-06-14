const api = require('../../utils/api.js');

Page({
  data: {
    classInfo: null,
    courseInfo: null,
    students: [],
    schedules: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.classId = options.id;
      this.loadData();
    }
  },

  async loadData() {
    try {
      const classInfo = await api.get('/classes/' + this.classId);
      if (!classInfo) {
        wx.showToast({ title: '班级不存在', icon: 'none' });
        return;
      }

      const courseInfo = classInfo.course_id ? await api.get('/courses/' + classInfo.course_id) : null;
      const students = await api.get('/classes/' + this.classId + '/students');
      const schedules = await api.get('/schedules', { class_id: this.classId });

      this.setData({
        classInfo,
        courseInfo: courseInfo || {},
        students,
        schedules,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  viewStudent(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-student-detail/teacher-student-detail?id=${id}`
    });
  }
});
