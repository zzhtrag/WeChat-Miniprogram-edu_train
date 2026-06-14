const api = require('../../utils/api.js');

Page({
  data: {
    classId: '',
    classInfo: null,
    courseInfo: null,
    teacherInfo: null,
    students: [],
    schedules: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ classId: options.id });
      this.loadData();
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  async loadData() {
    this.setData({ loading: true });

    try {
      const classInfo = await api.get('/classes/' + this.data.classId);

      if (!classInfo) {
        this.setData({ loading: false });
        wx.showToast({ title: '班级不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }

      const [courseInfo, teacherInfo, students, schedules] = await Promise.all([
        api.get('/courses/' + classInfo.course_id),
        api.get('/teachers/' + classInfo.teacher_id),
        api.get('/classes/' + classInfo.id + '/students'),
        api.get('/schedules', { class_id: classInfo.id })
      ]);

      this.setData({
        classInfo,
        courseInfo,
        teacherInfo,
        students: students || [],
        schedules: schedules || [],
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});
