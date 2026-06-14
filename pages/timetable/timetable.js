const api = require('../../utils/api.js');

Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    selectedDate: '',
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    calendarDays: [],
    todaySchedules: [],
    currentStudent: null,
    monthSchedules: [],
    courseDates: [],
    defaultDateDisplay: ''
  },

  onLoad() {
    const today = new Date();
    const defaultDateDisplay = (today.getMonth() + 1) + '月' + today.getDate() + '日';
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1,
      defaultDateDisplay
    });
    this.initCalendar();
    this.loadStudentData();
  },

  onShow() {
    this.loadStudentData();
  },

  async loadStudentData() {
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;
    this.setData({ currentStudent });
    await this.loadScheduleData();
    this.initCalendar();
  },

  initCalendar() {
    const { currentYear, currentMonth } = this.data;
    const days = this.generateCalendarDays(currentYear, currentMonth);
    this.setData({ calendarDays: days });
  },

  generateCalendarDays(year, month) {
    const days = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay() || 7;

    const courseDates = this.data.courseDates || [];

    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 2; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        date: `${month - 1}.${prevMonthDays - i}`,
        fullDate: this.formatDate(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasCourse: false
      });
    }

    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const fullDate = this.formatDate(year, month, i);
      const isToday = year === today.getFullYear() &&
                      month === today.getMonth() + 1 &&
                      i === today.getDate();
      const isSelected = fullDate === this.data.selectedDate;
      const hasCourse = courseDates.includes(fullDate);

      days.push({
        day: i,
        date: `${month}.${i}`,
        fullDate: fullDate,
        isCurrentMonth: true,
        isToday: isToday,
        isSelected: isSelected,
        hasCourse: hasCourse
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        date: `${month + 1}.${i}`,
        fullDate: this.formatDate(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasCourse: false
      });
    }

    return days;
  },

  formatDate(year, month, day) {
    const m = month < 1 ? 12 : (month > 12 ? 1 : month);
    const y = month < 1 ? year - 1 : (month > 12 ? year + 1 : year);
    return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  },

  async loadScheduleData() {
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;

    if (!currentStudent) {
      this.setData({ todaySchedules: [], monthSchedules: [], courseDates: [] });
      return;
    }

    try {
      const [enrollments, allSchedules] = await Promise.all([
        api.get('/students/' + currentStudent.id + '/enrollments'),
        api.get('/schedules', {})
      ]);
      const classIds = enrollments.map(e => e.class_id);
      const studentSchedules = allSchedules.filter(s => classIds.includes(s.class_id));

      const courseDates = [...new Set(studentSchedules.map(s => s.date))];

      const today = new Date().toISOString().split('T')[0];
      const todaySchedules = studentSchedules
        .filter(s => s.date === today)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map(s => ({
          id: s.id,
          courseName: s.course_name,
          className: s.class_name,
          room: s.room,
          startTime: s.start_time,
          endTime: s.end_time,
          teacherName: s.teacher_name,
          duration: s.duration,
          weekDay: s.week_day
        }));

      const monthSchedules = studentSchedules.map(s => ({
        ...s,
        displayDate: s.date.split('-').slice(1).join('/')
      }));

      this.setData({ todaySchedules, monthSchedules, courseDates });
    } catch (err) {
      wx.showToast({ title: '加载课表失败', icon: 'none' });
    }
  },

  async loadSelectedDateSchedule(date) {
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;
    if (!currentStudent) return;

    try {
      const [enrollments, allSchedules] = await Promise.all([
        api.get('/students/' + currentStudent.id + '/enrollments'),
        api.get('/schedules', {})
      ]);
      const classIds = enrollments.map(e => e.class_id);
      const daySchedules = allSchedules
        .filter(s => classIds.includes(s.class_id) && s.date === date)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      this.setData({ todaySchedules: daySchedules });
    } catch (err) {
      wx.showToast({ title: '加载课表失败', icon: 'none' });
    }
  },

  selectDate(e) {
    const { fullDate, date } = e.currentTarget.dataset;
    const days = this.data.calendarDays.map(day => ({
      ...day,
      isSelected: day.fullDate === fullDate
    }));
    this.setData({
      calendarDays: days,
      selectedDate: fullDate,
      selectedDateDisplay: date
    });
    this.loadSelectedDateSchedule(fullDate);
  },

  async prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentYear--;
      currentMonth = 12;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth });
    await this.loadScheduleData();
    this.initCalendar();
  },

  async nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentYear++;
      currentMonth = 1;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth });
    await this.loadScheduleData();
    this.initCalendar();
  },

  viewCourse(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${id}`
    });
  }
});
