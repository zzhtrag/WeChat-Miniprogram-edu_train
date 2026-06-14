const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: {},
    teacherDetail: null,
    todayCourses: [],
    pendingHomework: [],
    stats: {},
    quickMenus: [
      { icon: '📅', iconFile: 'calendar', label: '排课管理', url: '/pages/teacher-schedule/teacher-schedule' },
      { icon: '👥', iconFile: 'students', label: '学生档案', url: '/pages/teacher-students/teacher-students' },
      { icon: '📝', iconFile: 'homework', label: '作业管理', url: '/pages/teacher-homework/teacher-homework' },
      { icon: '📁', iconFile: 'materials', label: '教学资料', url: '/pages/teacher-materials/teacher-materials' },
      { icon: '🏆', iconFile: 'portfolio', label: '作品集', url: '/pages/teacher-portfolio/teacher-portfolio' },
      { icon: '📊', iconFile: 'stats', label: '我的数据', url: '/pages/teacher-stats/teacher-stats' },
      { icon: '📋', iconFile: 'class', label: '我的课表', url: '/pages/teacher-timetable/teacher-timetable' },
      { icon: '💬', iconFile: 'message', label: '消息通知', url: '/pages/teacher-messages/teacher-messages' }
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
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  async loadData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const teacherDetail = await api.get('/teachers/user/' + (userInfo?.id || ''));
      if (!teacherDetail) {
        this.setData({ loading: false });
        return;
      }

      const stats = await api.get('/teachers/' + teacherDetail.id + '/stats');
      const schedules = await api.get('/teachers/' + teacherDetail.id + '/schedules');

      const todayStr = new Date().toISOString().split('T')[0];
      const today = new Date();
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const todayDate = `${today.getMonth() + 1}月${today.getDate()}日 ${weekDays[today.getDay()]}`;

      // 过滤今日课程并获取学生人数
      const todaySchedules = schedules.filter(s => s.date === todayStr);
      const todayCourses = [];
      for (const s of todaySchedules) {
        const classInfo = await api.get('/classes/' + s.class_id);
        todayCourses.push({
          id: s.id,
          name: s.course_name || '课程',
          className: s.class_name || '班级',
          studentCount: classInfo?.student_ids?.length || 0,
          startTime: s.start_time,
          endTime: s.end_time,
          room: s.room,
          status: this.getCourseStatus(s)
        });
      }

      const assignments = await api.get('/teachers/' + teacherDetail.id + '/assignments');
      const pendingHomework = assignments
        .filter(h => h.status === 'published')
        .slice(0, 3);

      this.setData({
        userInfo,
        teacherDetail,
        teacherSubjects: teacherDetail?.subjects?.join('、') || '',
        teacherNo: teacherDetail?.employee_no || '',
        todayDate,
        todayCourses,
        pendingHomework,
        stats
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  getCourseStatus(schedule) {
    const now = new Date();
    const [startHour, startMin] = schedule.start_time.split(':').map(Number);
    const [endHour, endMin] = schedule.end_time.split(':').map(Number);

    const scheduleDate = new Date(schedule.date);
    const startDate = new Date(scheduleDate);
    startDate.setHours(startHour, startMin, 0);
    const endDate = new Date(scheduleDate);
    endDate.setHours(endHour, endMin, 0);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'completed';
  },

  goToMenu(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  goToProfile() {
    wx.navigateTo({
      url: '/pages/teacher-profile/teacher-profile'
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
