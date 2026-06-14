const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: {},
    currentStudent: null,
    stats: {},
    todaySchedules: [],
    pendingHomework: [],
    pointsBalance: 0,
    todayDate: '',
    quickMenus: [
      { iconFile: 'class', label: '我的班级', url: '/pages/my-courses/my-courses', badge: 0 },
      { iconFile: 'homework', label: '作业', url: '/pages/homework/homework', badge: 0 },
      { iconFile: 'scores', label: '成绩', url: '/pages/scores/scores', badge: 0 },
      { iconFile: 'calendar', label: '课表', url: '/pages/timetable/timetable', badge: 0 },
      { iconFile: 'progress', label: '学习进度', url: '/pages/progress/progress', badge: 0 },
      { iconFile: 'portfolio', label: '作品集', url: '/pages/parent-portfolio/parent-portfolio', badge: 0 },
      { iconFile: 'message', label: '消息', url: '/pages/messages/messages', badge: 0 },
      { iconFile: 'announce', label: '公告', url: '/pages/messages/messages', badge: 0 },
      { iconFile: 'gift', label: '礼品商城', url: '/pages/gift-shop/gift-shop', badge: 0 }
    ]
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
    const userInfo = app.globalData.userInfo || {};
    let currentStudent = app.globalData.currentStudent;

    const today = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const todayDate = `${today.getMonth() + 1}月${today.getDate()}日 ${weekDays[today.getDay()]}`;

    this.setData({ userInfo, todayDate });

    if (!currentStudent) {
      try {
        const parents = await api.get('/parents', { user_id: userInfo.id });
        if (parents && parents.length > 0) {
          const students = await api.get('/students', { parent_id: parents[0].id });
          if (students.length > 0) {
            app.setCurrentStudent(students[0]);
            this.setData({ currentStudent: students[0] });
            currentStudent = students[0];
          }
        }
      } catch (err) {
      }
    }

    if (!currentStudent) {
      this.setData({ currentStudent: null, stats: {}, todaySchedules: [], pendingHomework: [] });
      return;
    }

    try {
      const stats = await this.getStudentStats(currentStudent.id);

      const todayStr = new Date().toISOString().split('T')[0];
      const enrollments = await api.get('/students/' + currentStudent.id + '/enrollments');
      const classIds = enrollments.map(e => e.class_id);
      const allSchedules = await api.get('/schedules', { student_id: currentStudent.id });
      const todaySchedules = allSchedules.filter(s =>
        classIds.includes(s.class_id) && s.date === todayStr
      ).map(s => ({
        id: s.id,
        courseName: s.course_name,
        className: s.class_name,
        room: s.room,
        startTime: s.start_time,
        endTime: s.end_time,
        teacherName: s.teacher_name
      }));

      const homeworkList = await api.get('/students/' + currentStudent.id + '/homework');
      const pendingHomework = homeworkList.filter(h => h.submit_status !== 'graded').slice(0, 3);

      // Update homework badge in quickMenus
      const quickMenus = this.data.quickMenus.map(m => {
        if (m.iconFile === 'homework') {
          return { ...m, badge: stats.pendingHomework };
        }
        return m;
      });

      this.setData({
        userInfo,
        currentStudent,
        stats,
        todaySchedules,
        pendingHomework,
        quickMenus
      });

      this.loadPointsBalance();
    } catch (err) {
    }
  },

  async getStudentStats(studentId) {
    const enrollments = await api.get('/students/' + studentId + '/enrollments');
    const classIds = enrollments.map(e => e.class_id);

    const courseCount = enrollments.length;

    const allSchedules = await api.get('/schedules', { student_id: studentId });
    const studentSchedules = allSchedules.filter(s => classIds.includes(s.class_id));

    const now = new Date();
    const monthSchedules = studentSchedules.filter(s => {
      const date = new Date(s.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const monthHours = monthSchedules.reduce((sum, s) => sum + s.duration, 0);

    const attendances = await api.get('/attendances', { student_id: studentId });
    const presentCount = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = attendances.length > 0
      ? Math.round((presentCount / attendances.length) * 100)
      : 100;

    const homeworkList = await api.get('/students/' + studentId + '/homework');
    const pendingHomework = homeworkList.filter(h => h.submit_status !== 'graded').length;

    return {
      courseCount,
      monthHours,
      attendanceRate,
      pendingHomework
    };
  },

  goToMenu(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  async loadPointsBalance() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (!userInfo || userInfo.role !== 'parent') return;
    try {
      const parents = await api.get('/parents', { user_id: userInfo.id });
      if (parents && parents.length > 0) {
        const pointsInfo = await api.get('/gift-points', { parent_id: parents[0].id });
        this.setData({ pointsBalance: pointsInfo ? pointsInfo.balance : 0 });
      }
    } catch (err) {}
  },

  goToProfile() {
    wx.navigateTo({
      url: '/pages/parent-profile/parent-profile'
    });
  },

  viewHomework(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/homework-detail/homework-detail?id=${id}`
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.logout();
        }
      }
    });
  },
});
