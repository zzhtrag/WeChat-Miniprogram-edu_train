// pages/teacher-schedule/teacher-schedule.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    // 统计数据
    stats: {
      totalCourses: 0,
      totalHours: 0,
      totalStudents: 0,
      todayCourses: 0
    },
    // 筛选条件
    filterType: 'all', // all, today, week, upcoming
    selectedClassId: '',
    selectedDate: '',
    keyword: '',
    // 列表数据
    scheduleList: [],
    classList: [],
    // 加载状态
    loading: false,
    isEmpty: false,
    // 状态映射
    statusMap: {
      scheduled: { text: '待上课', class: 'pending', color: '#faad14' },
      ongoing: { text: '进行中', class: 'ongoing', color: '#1890ff' },
      completed: { text: '已结课', class: 'completed', color: '#999' },
      cancelled: { text: '已取消', class: 'cancelled', color: '#ff4d4f' }
    },
    // 批量排课日历
    showBatchCalendar: false,
    batchYear: new Date().getFullYear(),
    batchMonth: new Date().getMonth() + 1,
    batchWeekDays: ['一', '二', '三', '四', '五', '六', '日'],
    batchCalendarDays: [],
    selectedBatchDates: [],
    // 日历视图
    viewMode: 'list', // list / calendar
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth() + 1,
    calWeekDays: ['一', '二', '三', '四', '五', '六', '日'],
    calCalendarDays: [],
    calSelectedDates: [],
    calSelectedDateSchedules: [],
    calDisplayDate: '',
    calCourseDateMap: {}
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });

    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      // 根据 userId 查找教师信息
      const teacherDetail = await api.get('/teachers/user/' + (userInfo?.id || ''));

      if (!teacherDetail) {
        this.setData({ loading: false });
        return;
      }

      // 获取教师班级（已包含关联数据）
      const classes = await api.get('/teachers/' + teacherDetail.id + '/classes');
      const classOptions = classes.map(c => ({
        id: c.id,
        name: c.name,
        courseName: c.course_name || '',
        studentCount: c.current_students || 0
      }));

      // 获取排课列表（已包含关联数据）
      let schedules = await api.get('/teachers/' + teacherDetail.id + '/schedules');

      // 应用筛选
      schedules = this.applyFilters(schedules);

      // 转换数据（schedules 已包含 course_name, class_name 等）
      const scheduleList = schedules.map(s => {
        const statusInfo = this.data.statusMap[s.status] || this.data.statusMap.scheduled;

        return {
          id: s.id,
          courseId: s.course_id,
          courseName: s.course_name || '课程',
          classId: s.class_id,
          className: s.class_name || '班级',
          date: s.date,
          startTime: s.start_time,
          endTime: s.end_time,
          duration: s.duration || 2,
          room: s.room || '待定',
          studentCount: 0,
          status: s.status || 'scheduled',
          statusText: statusInfo.text,
          statusClass: statusInfo.class,
          statusColor: statusInfo.color,
          remarks: s.remarks || ''
        };
      });

      // 按日期排序
      scheduleList.sort((a, b) => new Date(b.date) - new Date(a.date) || b.startTime.localeCompare(a.startTime));

      // 计算统计数据
      const today = new Date().toISOString().split('T')[0];
      const todaySchedules = schedules.filter(s => s.date === today);

      const stats = {
        totalCourses: schedules.length,
        totalHours: schedules.reduce((sum, s) => sum + (s.duration || 2), 0),
        totalStudents: classOptions.reduce((sum, c) => sum + c.studentCount, 0),
        todayCourses: todaySchedules.length
      };

      this.setData({
        classList: classOptions,
        scheduleList,
        stats,
        loading: false,
        isEmpty: scheduleList.length === 0
      });

      // 更新日历视图数据
      this.buildCalCourseDateMap(schedules);
      if (this.data.viewMode === 'calendar') {
        this.generateCalCalendar();
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  // 应用筛选条件
  applyFilters(schedules) {
    const { filterType, selectedClassId, selectedDate, keyword } = this.data;
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    let result = [...schedules];

    // 日期类型筛选
    if (filterType === 'today') {
      result = result.filter(s => s.date === today);
    } else if (filterType === 'week') {
      result = result.filter(s => s.date >= today && s.date <= weekEndStr);
    } else if (filterType === 'upcoming') {
      result = result.filter(s => s.date >= today && (s.status === 'scheduled' || s.status === 'ongoing'));
    }

    // 班级筛选
    if (selectedClassId) {
      result = result.filter(s => s.class_id === selectedClassId);
    }

    // 日期筛选
    if (selectedDate) {
      result = result.filter(s => s.date === selectedDate);
    }

    // 关键词搜索（schedules 已包含关联数据）
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(s => {
        return (s.course_name || '').toLowerCase().includes(kw) ||
               (s.class_name || '').toLowerCase().includes(kw) ||
               (s.room || '').toLowerCase().includes(kw);
      });
    }

    return result;
  },

  // 切换筛选类型
  onFilterChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type });
    this.loadData();
  },

  // 班级筛选
  onClassChange(e) {
    const index = e.detail.value;
    if (index === 'all') {
      this.setData({ selectedClassId: '' });
    } else {
      const selected = this.data.classList[index - 1]; // 索引减1因为第一个是"全部"
      this.setData({ selectedClassId: selected?.id || '' });
    }
    this.loadData();
  },

  // 日期筛选
  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
    this.loadData();
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 搜索确认
  onSearch() {
    this.loadData();
  },

  // 清除筛选
  clearFilters() {
    this.setData({
      filterType: 'all',
      selectedClassId: '',
      selectedDate: '',
      keyword: ''
    });
    this.loadData();
  },

  // 添加排课 - 打开批量日历
  onAddSchedule() {
    if (this.data.classList.length === 0) {
      wx.showToast({ title: '暂无可排课的班级', icon: 'none' });
      return;
    }
    const today = new Date();
    this.setData({
      showBatchCalendar: true,
      batchYear: today.getFullYear(),
      batchMonth: today.getMonth() + 1,
      selectedBatchDates: []
    });
    this.generateBatchCalendar();
  },

  // 生成批量日历
  generateBatchCalendar() {
    const { batchYear, batchMonth, selectedBatchDates } = this.data;
    const days = [];
    const firstDay = new Date(batchYear, batchMonth - 1, 1);
    const lastDay = new Date(batchYear, batchMonth, 0);
    const startDayOfWeek = firstDay.getDay() || 7;
    const prevMonthDays = new Date(batchYear, batchMonth - 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = startDayOfWeek - 2; i >= 0; i--) {
      const fullDate = this.formatBatchDate(batchYear, batchMonth - 1, prevMonthDays - i);
      days.push({
        day: prevMonthDays - i,
        fullDate,
        isCurrentMonth: false,
        isToday: fullDate === todayStr,
        isSelected: selectedBatchDates.includes(fullDate)
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const fullDate = this.formatBatchDate(batchYear, batchMonth, i);
      const isToday = fullDate === todayStr;
      days.push({
        day: i,
        fullDate,
        isCurrentMonth: true,
        isToday,
        isSelected: selectedBatchDates.includes(fullDate)
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const fullDate = this.formatBatchDate(batchYear, batchMonth + 1, i);
      days.push({
        day: i,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: selectedBatchDates.includes(fullDate)
      });
    }

    this.setData({ batchCalendarDays: days });
  },

  formatBatchDate(year, month, day) {
    const m = month < 1 ? 12 : (month > 12 ? 1 : month);
    const y = month < 1 ? year - 1 : (month > 12 ? year + 1 : year);
    return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  },

  toggleBatchDate(e) {
    const { date, currentMonth } = e.currentTarget.dataset;
    if (!currentMonth) return;
    const dates = [...this.data.selectedBatchDates];
    const idx = dates.indexOf(date);
    if (idx > -1) {
      dates.splice(idx, 1);
    } else {
      dates.push(date);
    }
    dates.sort();
    this.setData({ selectedBatchDates: dates });
    this.generateBatchCalendar();
  },

  removeBatchDate(e) {
    const date = e.currentTarget.dataset.date;
    const dates = this.data.selectedBatchDates.filter(d => d !== date);
    this.setData({ selectedBatchDates: dates });
    this.generateBatchCalendar();
  },

  batchPrevMonth() {
    let { batchYear, batchMonth } = this.data;
    if (batchMonth === 1) { batchYear--; batchMonth = 12; }
    else { batchMonth--; }
    this.setData({ batchYear, batchMonth });
    this.generateBatchCalendar();
  },

  batchNextMonth() {
    let { batchYear, batchMonth } = this.data;
    if (batchMonth === 12) { batchYear++; batchMonth = 1; }
    else { batchMonth++; }
    this.setData({ batchYear, batchMonth });
    this.generateBatchCalendar();
  },

  closeBatchCalendar() {
    this.setData({ showBatchCalendar: false });
  },

  confirmBatchDates() {
    if (this.data.selectedBatchDates.length === 0) return;
    const datesParam = this.data.selectedBatchDates.join(',');
    this.setData({ showBatchCalendar: false });
    wx.navigateTo({
      url: `/pages/teacher-schedule-edit/teacher-schedule-edit?dates=${datesParam}`
    });
  },

  // ========== 日历视图方法 ==========

  switchToListView() {
    this.setData({ viewMode: 'list' });
  },

  switchToCalendarView() {
    this.setData({ viewMode: 'calendar' });
    this.buildCalCourseDateMap();
    this.generateCalCalendar();
  },

  buildCalCourseDateMap(schedules) {
    const list = schedules || this.data.scheduleList;
    const map = {};
    list.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    this.setData({ calCourseDateMap: map });
  },

  generateCalCalendar() {
    const { calYear, calMonth, calSelectedDates, calCourseDateMap } = this.data;
    const days = [];
    const firstDay = new Date(calYear, calMonth - 1, 1);
    const lastDay = new Date(calYear, calMonth, 0);
    const startDayOfWeek = firstDay.getDay() || 7;
    const prevMonthDays = new Date(calYear, calMonth - 1, 0).getDate();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = startDayOfWeek - 2; i >= 0; i--) {
      const fullDate = this.formatBatchDate(calYear, calMonth - 1, prevMonthDays - i);
      days.push({
        day: prevMonthDays - i,
        fullDate,
        isCurrentMonth: false,
        isToday: fullDate === todayStr,
        isSelected: calSelectedDates.includes(fullDate),
        hasCourse: !!calCourseDateMap[fullDate],
        courseCount: (calCourseDateMap[fullDate] || []).length
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const fullDate = this.formatBatchDate(calYear, calMonth, i);
      days.push({
        day: i,
        fullDate,
        isCurrentMonth: true,
        isToday: fullDate === todayStr,
        isSelected: calSelectedDates.includes(fullDate),
        hasCourse: !!calCourseDateMap[fullDate],
        courseCount: (calCourseDateMap[fullDate] || []).length
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const fullDate = this.formatBatchDate(calYear, calMonth + 1, i);
      days.push({
        day: i,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: calSelectedDates.includes(fullDate),
        hasCourse: !!calCourseDateMap[fullDate],
        courseCount: (calCourseDateMap[fullDate] || []).length
      });
    }

    this.setData({ calCalendarDays: days });
  },

  onCalDateTap(e) {
    const { date, currentMonth } = e.currentTarget.dataset;
    if (!currentMonth) return;
    const dates = [...this.data.calSelectedDates];
    const idx = dates.indexOf(date);
    if (idx > -1) {
      dates.splice(idx, 1);
    } else {
      dates.push(date);
    }
    dates.sort();

    // 如果只选了一个日期，显示该日课程
    let calSelectedDateSchedules = [];
    let calDisplayDate = '';
    if (dates.length === 1) {
      calDisplayDate = dates[0];
      calSelectedDateSchedules = this.data.scheduleList.filter(s => s.date === dates[0]);
    }

    this.setData({
      calSelectedDates: dates,
      calSelectedDateSchedules,
      calDisplayDate
    });
    this.generateCalCalendar();
  },

  calPrevMonth() {
    let { calYear, calMonth } = this.data;
    if (calMonth === 1) { calYear--; calMonth = 12; }
    else { calMonth--; }
    this.setData({ calYear, calMonth, calSelectedDates: [], calSelectedDateSchedules: [], calDisplayDate: '' });
    this.generateCalCalendar();
  },

  calNextMonth() {
    let { calYear, calMonth } = this.data;
    if (calMonth === 12) { calYear++; calMonth = 1; }
    else { calMonth++; }
    this.setData({ calYear, calMonth, calSelectedDates: [], calSelectedDateSchedules: [], calDisplayDate: '' });
    this.generateCalCalendar();
  },

  onBatchEdit() {
    const dates = this.data.calSelectedDates;
    if (dates.length === 0) return;
    // 找到选中日期的所有排课，跳转到第一个排课的编辑页
    const schedules = this.data.scheduleList.filter(s => dates.includes(s.date));
    if (schedules.length > 0) {
      wx.navigateTo({
        url: `/pages/teacher-schedule-edit/teacher-schedule-edit?id=${schedules[0].id}`
      });
    } else {
      // 没有排课的日期，跳转批量创建
      const datesParam = dates.join(',');
      wx.navigateTo({
        url: `/pages/teacher-schedule-edit/teacher-schedule-edit?dates=${datesParam}`
      });
    }
  },

  onBatchCancel() {
    const dates = this.data.calSelectedDates;
    if (dates.length === 0) return;
    const schedules = this.data.scheduleList.filter(s => dates.includes(s.date) && s.status === 'scheduled');
    if (schedules.length === 0) {
      wx.showToast({ title: '没有可取消的排课', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '批量取消',
      content: `确定要取消选中的 ${schedules.length} 条排课吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Promise.all(schedules.map(s => api.put('/schedules/' + s.id, { status: 'cancelled' })));
            wx.showToast({ title: `已取消${schedules.length}条排课`, icon: 'success' });
            this.setData({ calSelectedDates: [], calSelectedDateSchedules: [], calDisplayDate: '' });
            this.loadData();
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  onBatchDelete() {
    const dates = this.data.calSelectedDates;
    if (dates.length === 0) return;
    const schedules = this.data.scheduleList.filter(s => dates.includes(s.date));
    if (schedules.length === 0) {
      wx.showToast({ title: '没有可删除的排课', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '批量删除',
      content: `确定要删除选中的 ${schedules.length} 条排课吗？此操作不可撤销。`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Promise.all(schedules.map(s => api.delete('/schedules/' + s.id)));
            wx.showToast({ title: `已删除${schedules.length}条排课`, icon: 'success' });
            this.setData({ calSelectedDates: [], calSelectedDateSchedules: [], calDisplayDate: '' });
            this.loadData();
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 查看排课详情
  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-schedule-detail/teacher-schedule-detail?id=${id}`
    });
  },

  // 编辑排课
  onEditSchedule(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-schedule-edit/teacher-schedule-edit?id=${id}`
    });
  },

  // 删除排课
  onDeleteSchedule(e) {
    const id = e.currentTarget.dataset.id;
    const schedule = this.data.scheduleList.find(s => s.id === id);

    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${schedule?.courseName}」的排课记录吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doDeleteSchedule(id);
        }
      }
    });
  },

  // 执行删除
  async doDeleteSchedule(id) {
    try {
      await api.delete('/schedules/' + id);
      wx.showToast({ title: '删除成功', icon: 'success' });
      this.loadData();
    } catch (err) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  // 取消排课
  onCancelSchedule(e) {
    const id = e.currentTarget.dataset.id;
    const schedule = this.data.scheduleList.find(s => s.id === id);

    wx.showModal({
      title: '确认取消',
      content: `确定要取消「${schedule?.courseName}」的排课吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doCancelSchedule(id);
        }
      }
    });
  },

  async doCancelSchedule(id) {
    try {
      await api.put('/schedules/' + id, { status: 'cancelled' });
      wx.showToast({ title: '已取消', icon: 'success' });
      this.loadData();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 空操作方法，用于阻止事件冒泡
  noop() {}
});
