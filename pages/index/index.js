const api = require('../../utils/api.js');
const format = require('../../utils/format.js');

Page({
  data: {
    userInfo: {},
    currentStudent: null,
    todayCourses: [],
    pendingHomework: [],
    notices: [],
    studyStats: {},
    quickMenus: [
      { icon: '📅', label: '我的课表', url: '/pages/timetable/timetable', isTab: true },
      { icon: '📚', label: '我的班级', url: '/pages/my-courses/my-courses', isTab: false },
      { icon: '📝', label: '我的作业', url: '/pages/homework/homework', isTab: true },
      { icon: '📊', label: '学习进度', url: '/pages/progress/progress', isTab: false },
      { icon: '💬', label: '消息通知', url: '/pages/messages/messages', isTab: false }
    ]
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        currentStudent: app.globalData.currentStudent
      });
      this.loadData();
    }
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
    const currentStudent = app.globalData.currentStudent;

    if (!currentStudent) {
      return;
    }

    try {
      const [announcements, schedules, courses, teachers, homeworkList] = await Promise.all([
        api.get('/announcements'),
        api.get('/students/' + currentStudent.id + '/schedules'),
        api.get('/courses'),
        api.get('/teachers'),
        api.get('/students/' + currentStudent.id + '/homework')
      ]);

      const notices = (announcements || []).filter(a =>
        a.type === 'system' || a.type === 'parent'
      ).map(item => ({
        ...item,
        relativeTime: format.formatRelativeTime(item.created_at)
      }));

      const today = new Date().toISOString().split('T')[0];
      const todayCourses = (schedules || []).filter(s => s.date === today).map(s => {
        const course = (courses || []).find(c => c.id === s.course_id);
        const teacher = (teachers || []).find(t => t.id === s.teacher_id);
        return {
          id: s.id,
          name: course?.name || '课程',
          teacher: teacher?.name || '老师',
          teacherAvatar: teacher?.avatar || '',
          startTime: s.start_time,
          endTime: s.end_time,
          status: this.getCourseStatus(s),
          room: s.room
        };
      });

      const pendingHomework = (homeworkList || []).filter(h => h.submitStatus === 'pending');

      const studyStats = {
        courseCount: 0,
        weekHours: 0,
        pendingHomework: 0,
        courseProgress: 0,
        homeworkCompletion: 0,
        attendance: 0
      };

      this.setData({
        userInfo,
        currentStudent,
        notices,
        todayCourses,
        pendingHomework,
        studyStats
      });
    } catch (err) {
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

  viewNotice(e) {
    const id = e.currentTarget.dataset.id;
    const notice = this.data.notices.find(n => n.id === id);
    if (notice) {
      wx.showModal({
        title: notice.title,
        content: notice.content,
        showCancel: false
      });
    }
  },

  viewCourse(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    });
  },

  viewHomework(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/homework-detail/homework-detail?id=${id}`
    });
  },

  goToTimetable() {
    wx.switchTab({
      url: '/pages/timetable/timetable'
    });
  },

  goToHomework() {
    wx.switchTab({
      url: '/pages/homework/homework'
    });
  },

  goToPage(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  goToQuickMenu(e) {
    const { url, istab } = e.currentTarget.dataset;
    if (istab) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({ url });
    }
  },

  goToMyCourses() {
    wx.navigateTo({
      url: '/pages/my-courses/my-courses'
    });
  }
});
