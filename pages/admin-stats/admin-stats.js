// pages/admin-stats/admin-stats.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    // 加载状态
    loading: false,
    // 当前选中标签
    activeTab: 'overview',
    // 概览数据
    overview: {
      teachers: 0,
      students: 0,
      classes: 0,
      courses: 0,
      parents: 0,
      assignments: 0,
      attendance: 0,
      monthNewStudents: 0,
      monthNewTeachers: 0,
      activeClasses: 0
    },
    // 增长趋势数据
    trend: {
      students: [12, 18, 25, 32, 40, 48],
      teachers: [4, 5, 5, 6, 6, 6],
      classes: [1, 1, 2, 2, 2, 2]
    },
    // 各班级人数分布
    classDistribution: [],
    // 各科目统计
    subjectStats: [],
    // 各年级统计
    gradeStats: [],
    // 教师带班统计
    teacherClassStats: [],
    // 考勤统计
    attendanceStats: {
      normal: 0,
      late: 0,
      absent: 0,
      leave: 0,
      total: 0
    }
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

  // 加载统计数据
  async loadData() {
    this.setData({ loading: true });

    const teachers = await api.get('/teachers');
    const students = await api.get('/students');
    const classes = await api.get('/classes');
    const courses = await api.get('/courses');
    const parents = await api.get('/parents');
    const assignments = await api.get('/assignments');
    const attendances = await api.get('/attendances');

    // 计算本月新增
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthNewStudents = students.filter(s => s.created_at >= monthStart).length;
    const monthNewTeachers = teachers.filter(t => t.created_at >= monthStart).length;

    const classDistribution = await this.getClassDistribution();
    const subjectStats = await this.getSubjectStats();
    const gradeStats = await this.getGradeStats();
    const teacherClassStats = await this.getTeacherClassStats();
    const attendanceStats = await this.getAttendanceStats();

    this.setData({
      overview: {
        teachers: teachers.length,
        students: students.length,
        classes: classes.length,
        courses: courses.length,
        parents: parents.length,
        assignments: assignments.length,
        monthNewStudents: monthNewStudents,
        monthNewTeachers: monthNewTeachers,
        activeClasses: classes.filter(c => c.status === 'active').length
      },
      trend: {
        students: [12, 15, 18, 22, 26, 30],
        teachers: [4, 4, 5, 5, 6, 6],
        classes: [1, 1, 2, 2, 2, 2]
      },
      classDistribution,
      subjectStats,
      gradeStats,
      teacherClassStats,
      attendanceStats,
      loading: false
    });
  },

  // 获取班级人数分布
  async getClassDistribution() {
    const classes = await api.get('/classes');
    const result = [];
    for (const c of classes) {
      const students = await api.get('/classes/' + c.id + '/students');
      result.push({
        id: c.id,
        name: c.name,
        courseName: c.course_name || '',
        current: students.length,
        capacity: c.capacity || 30,
        percentage: Math.round((students.length / (c.capacity || 30)) * 100)
      });
    }
    return result;
  },

  // 获取科目统计
  async getSubjectStats() {
    const subjects = {};
    const classes = await api.get('/classes');
    const courses = await api.get('/courses');

    for (const c of classes) {
      const course = courses.find(co => co.id === c.course_id);
      if (course) {
        const subject = course.subject || '其他';
        if (!subjects[subject]) {
          subjects[subject] = { name: subject, classes: 0, students: 0 };
        }
        subjects[subject].classes++;
        const students = await api.get('/classes/' + c.id + '/students');
        subjects[subject].students += students.length;
      }
    }
    return Object.values(subjects);
  },

  // 获取年级统计
  async getGradeStats() {
    const grades = {};
    const students = await api.get('/students');
    students.forEach(s => {
      const grade = s.grade || '其他';
      if (!grades[grade]) {
        grades[grade] = { name: grade, count: 0 };
      }
      grades[grade].count++;
    });
    return Object.values(grades);
  },

  // 获取教师带班统计
  async getTeacherClassStats() {
    const teachers = await api.get('/teachers');
    const result = [];
    for (const t of teachers) {
      const classes = await api.get('/teachers/' + t.id + '/classes');
      const students = await api.get('/teachers/' + t.id + '/students');
      result.push({
        id: t.id,
        name: t.name,
        classCount: classes.length,
        studentCount: students.length
      });
    }
    return result;
  },

  // 获取考勤统计
  async getAttendanceStats() {
    const stats = {
      normal: 0,
      late: 0,
      absent: 0,
      leave: 0,
      total: 0
    };

    const attendances = await api.get('/attendances');
    attendances.forEach(a => {
      stats.total++;
      if (a.status === 'present') stats.normal++;
      else if (a.status === 'late') stats.late++;
      else if (a.status === 'absent') stats.absent++;
      else if (a.status === 'leave') stats.leave++;
    });

    return stats;
  },

  // 切换标签
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 跳转到学员页面
  goToStudents() {
    wx.navigateTo({
      url: '/pages/admin-students/admin-students'
    });
  },

  // 跳转到教师页面
  goToTeachers() {
    wx.navigateTo({
      url: '/pages/admin-teachers/admin-teachers'
    });
  },

  // 跳转到班级页面
  goToClasses() {
    wx.navigateTo({
      url: '/pages/admin-classes/admin-classes'
    });
  },

  // 跳转到课程页面
  goToCourses() {
    wx.navigateTo({
      url: '/pages/admin-courses/admin-courses'
    });
  }
});
