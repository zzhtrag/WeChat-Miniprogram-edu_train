const api = require('../../utils/api.js');

Page({
  data: {
    // 教师信息
    teacherInfo: null,
    // 基础统计
    stats: {
      classCount: 0,
      studentCount: 0,
      monthHours: 0,
      monthNewStudents: 0,
      attendanceRate: 0,
      assignmentCount: 0
    },
    // 课程数据
    courseStats: [],
    // 考勤统计
    attendanceStats: {
      total: 0,
      present: 0,
      late: 0,
      absent: 0
    },
    // 加载状态
    loading: true
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '我的数据' });
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 1000);
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });

    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const teacher = await api.get('/teachers/user/' + (userInfo?.id || ''));
      if (!teacher) {
        this.setData({ loading: false });
        return;
      }

      const teacherDetail = await api.get('/teachers/' + teacher.id);
      if (!teacherDetail) {
        this.setData({ loading: false });
        return;
      }

      // 获取统计数据
      const stats = await api.get('/teachers/' + teacherDetail.id + '/stats');

      // 获取课程列表（用于统计每周上课情况）
      const schedules = await api.get('/teachers/' + teacherDetail.id + '/schedules');

      // 获取考勤记录
      const attendances = await api.get('/teachers/' + teacherDetail.id + '/attendances');

      // 获取作业列表
      const assignments = await api.get('/teachers/' + teacherDetail.id + '/assignments');

      // 计算课程统计（按课程分组）
      const courseMap = {};
      schedules.forEach(s => {
        const courseName = s.course_name || '其他';
        if (!courseMap[courseName]) {
          courseMap[courseName] = { name: courseName, count: 0, hours: 0 };
        }
        courseMap[courseName].count++;
        courseMap[courseName].hours += s.duration || 2;
      });
      const courseStats = Object.values(courseMap).slice(0, 5);

      // 计算考勤统计
      const presentCount = attendances.filter(a => a.status === 'present').length;
      const lateCount = attendances.filter(a => a.status === 'late').length;
      const absentCount = attendances.filter(a => a.status === 'absent').length;
      const attendanceRate = attendances.length > 0
        ? Math.round((presentCount + lateCount) / attendances.length * 100)
        : 0;

      const attendanceStats = {
        total: attendances.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        rate: attendanceRate
      };

      // 计算本周每天的课时分布
      const weekSchedule = this.getWeekSchedule(schedules);

      this.setData({
        teacherInfo: { ...teacherDetail, subjectsLabel: (teacherDetail.subjects || []).join('、') },
        stats: {
          classCount: stats.class_count || 0,
          studentCount: stats.student_count || 0,
          monthHours: stats.month_hours || 0,
          monthNewStudents: stats.month_new_students || 0,
          attendanceRate: stats.attendance_rate || 0,
          assignmentCount: stats.assignment_count || 0
        },
        courseStats,
        attendanceStats,
        weekSchedule,
        updateTime: new Date().toLocaleString(),
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  // 计算本周每天的课时
  getWeekSchedule(schedules) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekSchedule = weekDays.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];

      const daySchedules = schedules.filter(s => s.date === dateStr);
      const hours = daySchedules.reduce((sum, s) => sum + (s.duration || 2), 0);

      return {
        day: day,
        hours: hours,
        count: daySchedules.length
      };
    });

    return weekSchedule;
  },

  // 查看班级详情
  onViewClasses() {
    wx.navigateTo({
      url: '/pages/teacher-schedule/teacher-schedule'
    });
  },

  // 查看学生列表
  onViewStudents() {
    wx.navigateTo({
      url: '/pages/teacher-students/teacher-students'
    });
  },

  // 查看作业管理
  onViewAssignments() {
    wx.navigateTo({
      url: '/pages/teacher-homework/teacher-homework'
    });
  }
});
