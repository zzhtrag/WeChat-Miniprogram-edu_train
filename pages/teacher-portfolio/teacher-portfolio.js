const api = require('../../utils/api.js');

Page({
  data: {
    classes: [],
    selectedClassId: '',
    selectedClassName: '',
    selectedClassIndex: 0,
    viewMode: 'student', // student | timeline
    portfolioItems: [],
    studentGroups: [],
    timelineGroups: [],
    stats: {},
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 800);
  },

  async loadData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      this.setData({ loading: false });
      return;
    }

    try {
      const teachers = await api.get('/teachers');
      const teacher = teachers?.find(t => t.user_id === userInfo.id);
      if (!teacher) {
        this.setData({ loading: false });
        return;
      }

      const teacherId = teacher.id;
      const classes = await api.get('/teachers/' + teacherId + '/classes');

      let classId = this.data.selectedClassId;
      if (!classId && classes.length > 0) {
        classId = classes[0].id;
      }

      const className = classes.find(c => c.id === classId)?.name || '';
      const classIndex = classes.findIndex(c => c.id === classId);
      const stats = classId ? await api.get('/classes/' + classId + '/portfolio-stats') : {};
      const items = classId ? await api.get('/portfolios', { class_id: classId, status: 'active' }) : [];

      const studentGroups = this.groupByStudent(items);
      const timelineGroups = this.groupByMonth(items);

      this.setData({
        teacherId,
        classes,
        selectedClassId: classId,
        selectedClassName: className,
        selectedClassIndex: classIndex >= 0 ? classIndex : 0,
        portfolioItems: items,
        studentGroups,
        timelineGroups,
        stats,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  groupByStudent(items) {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.student_id]) {
        groups[item.student_id] = {
          student_id: item.student_id,
          student_name: item.student_name,
          student_avatar: item.student_avatar,
          items: [],
          count: 0,
          excellent_count: 0
        };
      }
      groups[item.student_id].items.push(item);
      groups[item.student_id].count++;
      if (item.is_excellent) groups[item.student_id].excellent_count++;
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  },

  groupByMonth(items) {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.work_date);
      const key = date.getFullYear() + '年' + (date.getMonth() + 1) + '月';
      if (!groups[key]) groups[key] = { month: key, items: [] };
      groups[key].items.push(item);
    });
    return Object.values(groups).sort((a, b) => {
      return a.month > b.month ? -1 : 1;
    });
  },

  selectClass(e) {
    const index = e.detail.value;
    this.setData({ selectedClassIndex: index, selectedClassId: this.data.classes[index]?.id || '' }, () => this.loadData());
  },

  switchView(e) {
    this.setData({ viewMode: e.currentTarget.dataset.mode });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/teacher-portfolio-detail/teacher-portfolio-detail?id=' + id });
  },

  goToAdd() {
    const classId = this.data.selectedClassId;
    wx.navigateTo({ url: '/pages/teacher-portfolio-add/teacher-portfolio-add?class_id=' + (classId || '') });
  },

  toggleStudentExpand(e) {
    const studentId = e.currentTarget.dataset.id;
    const expanded = this.data.expandedStudent === studentId ? '' : studentId;
    this.setData({ expandedStudent: expanded });
  }
});
