// pages/teacher-timetable/teacher-timetable.js
const api = require('../../utils/api.js');

Page({
  data: {
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    // 月历
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarDays: [],
    calendarExpanded: false,
    // 周历
    weekDates: [],
    currentDate: '',
    currentWeek: 0,
    weekLabel: 1,
    isToday: false,
    // 数据
    todaySchedules: [],
    tomorrowSchedules: [],
    todayDisplay: '',
    tomorrowDisplay: '',
    selectedOtherDate: false,
    selectedDateDisplay: '',
    selectedDateSchedules: [],
    weekSchedules: [],
    allSchedules: [],
    weekStats: {
      totalHours: 0,
      totalCourses: 0,
      totalStudents: 0
    },
    loading: true,
    courseDateSet: {}
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '我的课表' });
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    this.setData({ currentDate });
    this.initWeekDates();
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 1000);
  },

  // 初始化本周日期
  initWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + i);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      weekDates.push({
        date: dateStr,
        day: date.getDate(),
        weekDay: weekDays[date.getDay()],
        isToday: dateStr === todayStr,
        hasCourse: false
      });
    }
    this.setData({ weekDates });
  },

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

      const schedules = await api.get('/teachers/' + teacher.id + '/schedules');

      // 并行获取每个班级信息
      const classIds = [...new Set(schedules.map(s => s.class_id))];
      const classMap = {};
      await Promise.all(classIds.map(async id => {
        try {
          const classItem = await api.get('/classes/' + id);
          classMap[id] = classItem;
        } catch (err) {
          classMap[id] = null;
        }
      }));

      const weekSchedules = schedules.map(s => {
        const classItem = classMap[s.class_id];
        return {
          ...s,
          courseName: s.course_name || '课程',
          className: s.class_name || '班级',
          studentCount: classItem?.current_students || 0
        };
      });

      // 构建有课日期集合
      const courseDateSet = {};
      weekSchedules.forEach(s => {
        courseDateSet[s.date] = true;
      });

      // 更新周历的 hasCourse
      const weekDates = this.data.weekDates.map(d => ({
        ...d,
        hasCourse: !!courseDateSet[d.date]
      }));

      // 当日课程
      const todaySchedules = weekSchedules.filter(s => s.date === this.data.currentDate);
      const todayWithStatus = todaySchedules.map(s => this.getScheduleStatus(s));

      // 明天的课程
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const tomorrowSchedules = weekSchedules.filter(s => s.date === tomorrowStr);
      const tomorrowWithStatus = tomorrowSchedules.map(s => this.getScheduleStatus(s));

      // 日期显示
      const todayObj = new Date();
      const todayDisplay = (todayObj.getMonth() + 1) + '月' + todayObj.getDate() + '日';
      const tomorrowDisplay = (tomorrow.getMonth() + 1) + '月' + tomorrow.getDate() + '日';

      // 本周统计
      const weekDateStrs = weekDates.map(d => d.date);
      const currentWeekSchedules = weekSchedules.filter(s => weekDateStrs.includes(s.date));
      const weekStats = await this.calculateWeekStats(currentWeekSchedules);

      this.setData({
        weekSchedules,
        allSchedules: weekSchedules,
        todaySchedules: todayWithStatus,
        tomorrowSchedules: tomorrowWithStatus,
        todayDisplay,
        tomorrowDisplay,
        courseDateSet,
        weekDates,
        isToday: this.data.currentDate === new Date().toISOString().split('T')[0],
        weekStats,
        loading: false
      });

      // 如果月历已展开，更新月历
      if (this.data.calendarExpanded) {
        this.generateCalendarDays();
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  // 展开/收起日历
  toggleCalendarExpand() {
    const expanded = !this.data.calendarExpanded;
    this.setData({ calendarExpanded: expanded });
    if (expanded) {
      this.generateCalendarDays();
    }
  },

  // 生成月历日期
  generateCalendarDays() {
    const { currentYear, currentMonth, currentDate, courseDateSet } = this.data;
    const days = [];
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDayOfWeek = firstDay.getDay();
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 上月
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const fullDate = this.formatDate(currentYear, currentMonth - 1, prevMonthDays - i);
      days.push({
        day: prevMonthDays - i,
        fullDate,
        isCurrentMonth: false,
        isToday: fullDate === todayStr,
        isSelected: fullDate === currentDate,
        hasCourse: !!courseDateSet[fullDate]
      });
    }

    // 当月
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const fullDate = this.formatDate(currentYear, currentMonth, i);
      const isToday = fullDate === todayStr;
      days.push({
        day: i,
        fullDate,
        isCurrentMonth: true,
        isToday,
        isSelected: fullDate === currentDate,
        hasCourse: !!courseDateSet[fullDate]
      });
    }

    // 下月
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const fullDate = this.formatDate(currentYear, currentMonth + 1, i);
      days.push({
        day: i,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: fullDate === currentDate,
        hasCourse: !!courseDateSet[fullDate]
      });
    }

    this.setData({ calendarDays: days });
  },

  formatDate(year, month, day) {
    const m = month < 1 ? 12 : (month > 12 ? 1 : month);
    const y = month < 1 ? year - 1 : (month > 12 ? year + 1 : year);
    return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  },

  getScheduleStatus(schedule) {
    const now = new Date();
    const [startHour, startMin] = (schedule.start_time || '09:00').split(':').map(Number);
    const [endHour, endMin] = (schedule.end_time || '11:00').split(':').map(Number);

    const scheduleDate = new Date(schedule.date);
    const startDate = new Date(scheduleDate);
    startDate.setHours(startHour, startMin, 0);
    const endDate = new Date(scheduleDate);
    endDate.setHours(endHour, endMin, 0);

    let status = 'upcoming';
    let statusText = '未开始';
    let statusClass = 'upcoming';

    if (schedule.status === 'cancelled') {
      status = 'cancelled'; statusText = '已取消'; statusClass = 'cancelled';
    } else if (schedule.status === 'completed') {
      status = 'completed'; statusText = '已结束'; statusClass = 'completed';
    } else if (now < startDate) {
      status = 'upcoming'; statusText = '未开始'; statusClass = 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      status = 'ongoing'; statusText = '进行中'; statusClass = 'ongoing';
    } else {
      status = 'completed'; statusText = '已结束'; statusClass = 'completed';
    }

    return {
      ...schedule,
      startTime: schedule.start_time || '09:00',
      endTime: schedule.end_time || '11:00',
      status, statusText, statusClass
    };
  },

  async calculateWeekStats(schedules) {
    const totalHours = schedules.reduce((sum, s) => sum + (s.duration || 2), 0);
    const totalCourses = schedules.length;
    const studentSet = new Set();

    // 并行获取每个班级的学生
    const classIds = [...new Set(schedules.map(s => s.class_id))];
    await Promise.all(classIds.map(async classId => {
      try {
        const classStudents = await api.get('/classes/' + classId + '/students');
        classStudents.forEach(st => studentSet.add(st.id));
      } catch (err) {
        // 忽略单个班级加载失败
      }
    }));

    return { totalHours, totalCourses, totalStudents: studentSet.size };
  },

  // 月份切换
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) { currentYear--; currentMonth = 12; }
    else { currentMonth--; }
    this.setData({ currentYear, currentMonth });
    if (this.data.calendarExpanded) {
      this.generateCalendarDays();
    }
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) { currentYear++; currentMonth = 1; }
    else { currentMonth++; }
    this.setData({ currentYear, currentMonth });
    if (this.data.calendarExpanded) {
      this.generateCalendarDays();
    }
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date || e.currentTarget.dataset.fullDate;
    if (!date) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 更新月历选中状态
    if (this.data.calendarExpanded) {
      const calendarDays = this.data.calendarDays.map(d => ({
        ...d,
        isSelected: d.fullDate === date
      }));
      this.setData({ calendarDays });
    }

    // 如果选的是今天或明天，回到默认的双日视图
    if (date === todayStr || date === tomorrowStr) {
      this.setData({
        currentDate: date,
        selectedOtherDate: false,
        isToday: date === todayStr
      });
      this.loadData();
      return;
    }

    // 其他日期
    const schedules = this.data.allSchedules.filter(s => s.date === date);
    const schedulesWithStatus = schedules.map(s => this.getScheduleStatus(s));
    const dateObj = new Date(date);
    const dateDisplay = (dateObj.getMonth() + 1) + '月' + dateObj.getDate() + '日';

    this.setData({
      currentDate: date,
      selectedOtherDate: true,
      selectedDateDisplay: dateDisplay,
      selectedDateSchedules: schedulesWithStatus,
      isToday: false
    });
  },

  // 查看课程详情
  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-schedule-detail/teacher-schedule-detail?id=${id}`
    });
  }
});
