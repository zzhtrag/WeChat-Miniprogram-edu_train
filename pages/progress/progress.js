const api = require('../../utils/api.js');

Page({
  data: {
    currentStudent: null,
    courseProgress: [],
    overallStats: {}
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
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;

    if (!currentStudent) {
      this.setData({ currentStudent: null, courseProgress: [], overallStats: {} });
      return;
    }

    try {
      const [enrollments, courses, attendances, homeworkList] = await Promise.all([
        api.get('/students/' + currentStudent.id + '/enrollments'),
        api.get('/courses'),
        api.get('/attendances', { student_id: currentStudent.id }),
        api.get('/students/' + currentStudent.id + '/homework')
      ]);

      const courseMap = {};
      courses.forEach(c => { courseMap[c.id] = c; });

      const courseProgress = [];

      for (const enrollment of enrollments) {
        const course = courseMap[enrollment.course_id];
        const classInfo = await api.get('/classes/' + enrollment.class_id);
        const schedules = await api.get('/schedules', { class_id: enrollment.class_id });

        const now = new Date();
        const totalSchedules = schedules.length;
        const completedSchedules = schedules.filter(s => {
          const date = new Date(s.date);
          return date < now;
        }).length;
        const todaySchedules = schedules.filter(s => s.date === now.toISOString().split('T')[0]).length;

        const classAttendances = attendances.filter(a => a.class_id === enrollment.class_id);
        const presentCount = classAttendances.filter(a => a.status === 'present' || a.status === 'late').length;
        const attendanceRate = classAttendances.length > 0
          ? Math.round((presentCount / classAttendances.length) * 100)
          : 100;

        const classHomework = homeworkList.filter(h => h.class_id === enrollment.class_id);
        const totalHomework = classHomework.length;
        const completedHomework = classHomework.filter(h => h.submit_status === 'graded').length;
        const homeworkRate = totalHomework > 0 ? Math.round((completedHomework / totalHomework) * 100) : 100;

        const progressRate = Math.round((completedSchedules / Math.max(totalSchedules, 1)) * 100);

        courseProgress.push({
          id: enrollment.course_id,
          classId: enrollment.class_id,
          courseName: course?.name || '课程',
          subject: course?.subject || '',
          className: classInfo?.name || '',
          totalSchedules,
          completedSchedules,
          todaySchedules,
          attendanceRate,
          totalHomework,
          completedHomework,
          homeworkRate,
          progressRate
        });
      }

      const totalSchedules = courseProgress.reduce((sum, c) => sum + c.totalSchedules, 0);
      const completedSchedules = courseProgress.reduce((sum, c) => sum + c.completedSchedules, 0);
      const totalAttendanceRate = courseProgress.length > 0
        ? Math.round(courseProgress.reduce((sum, c) => sum + c.attendanceRate, 0) / courseProgress.length)
        : 100;
      const totalHomeworkRate = courseProgress.length > 0
        ? Math.round(courseProgress.reduce((sum, c) => sum + c.homeworkRate, 0) / courseProgress.length)
        : 100;

      const overallStats = {
        totalCourses: courseProgress.length,
        totalSchedules,
        completedSchedules,
        overallProgress: totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0,
        attendanceRate: totalAttendanceRate,
        homeworkRate: totalHomeworkRate
      };

      this.setData({
        currentStudent,
        courseProgress,
        overallStats
      });
    } catch (err) {
      wx.showToast({ title: '加载数据失败', icon: 'none' });
    }
  }
});
