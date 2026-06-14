const api = require('../../utils/api.js');

Page({
  data: {
    // 学员ID
    studentId: '',
    // 学员信息
    student: null,
    // 关联信息
    enrollments: [],
    attendances: [],
    grades: [],
    portfolioItems: [],
    // 统计数据
    stats: {
      totalCourses: 0,
      attendanceRate: 0,
      avgGrade: 0
    },
    // 当前标签页
    currentTab: 'info',
    // 操作菜单
    showActionSheet: false,
    // 加载状态
    loading: false
  },

  onLoad(options) {
    this.setData({
      studentId: options.id || '',
      currentTab: options.tab || 'info'
    });
    this.loadStudentDetail();
  },

  // 加载学员详情
  async loadStudentDetail() {
    this.setData({ loading: true });

    try {
      const student = await api.get('/students/' + this.data.studentId);
      if (!student) {
        wx.showToast({
          title: '学员不存在',
          icon: 'none'
        });
        wx.navigateBack();
        return;
      }

      // 获取选课记录
      const enrollments = await api.get('/students/' + this.data.studentId + '/enrollments');

      // 获取考勤记录
      const attendances = await api.get('/students/' + this.data.studentId + '/attendances');

      // 获取成绩记录
      const grades = await api.get('/students/' + this.data.studentId + '/grades');

      // 获取作品集
      const portfolioItems = await api.get('/portfolios', { student_id: this.data.studentId, status: 'active' });

      // 计算统计数据
      const totalCourses = enrollments.length;
      const attendanceRate = attendances.length > 0
        ? Math.round((attendances.filter(a => a.status === 'present').length / attendances.length) * 100)
        : 0;
      const avgGrade = grades.length > 0
        ? Math.round((grades.reduce((sum, g) => sum + g.score, 0) / grades.length) * 10) / 10
        : 0;

      this.setData({
        student: student,
        enrollments: enrollments,
        attendances: attendances,
        grades: grades,
        portfolioItems: portfolioItems,
        stats: {
          totalCourses: totalCourses,
          attendanceRate: attendanceRate,
          avgGrade: avgGrade
        },
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  // 切换标签页
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
  },

  // 显示操作菜单
  showActions() {
    this.setData({
      showActionSheet: true
    });
  },

  // 隐藏操作菜单
  hideActionSheet() {
    this.setData({
      showActionSheet: false
    });
  },

  // 拨打电话
  callParent() {
    if (this.data.student.parent_phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.student.parent_phone,
        fail: () => {
          wx.showToast({
            title: '拨打失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 发送消息
  sendMessage() {
    this.setData({ showActionSheet: false });
    wx.navigateTo({
      url: '/pages/teacher-messages/teacher-messages'
    });
  },

  // 查看班级详情
  viewClassDetail(e) {
    const classId = e.currentTarget.dataset.classid;
    wx.navigateTo({
      url: `/pages/teacher-class-detail/teacher-class-detail?id=${classId}`
    });
  },

  // 查看课程详情
  viewCourseDetail(e) {
    const courseId = e.currentTarget.dataset.courseid;
    wx.navigateTo({
      url: `/pages/teacher-course-detail/teacher-course-detail?id=${courseId}`
    });
  },

  // 获取状态标签
  getStatusTag(status) {
    const tags = {
      'active': '在读',
      'inactive': '休学',
      'graduated': '毕业'
    };
    return tags[status] || status;
  },

  // 获取考勤状态标签
  getAttendanceTag(status) {
    const tags = {
      'present': '出勤',
      'late': '迟到',
      'absent': '缺勤',
      'leave': '请假'
    };
    return tags[status] || status;
  },

  // 获取考勤状态颜色
  getAttendanceColor(status) {
    const colors = {
      'present': '#52c41a',
      'late': '#faad14',
      'absent': '#ff4d4f',
      'leave': '#999'
    };
    return colors[status] || '#999';
  },

  // 获取选课状态标签
  getEnrollmentStatus(status) {
    const tags = {
      'active': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return tags[status] || status;
  },

  // 获取选课状态颜色
  getEnrollmentColor(status) {
    const colors = {
      'active': '#52c41a',
      'completed': '#1890ff',
      'cancelled': '#999'
    };
    return colors[status] || '#999';
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 查看作品详情
  viewPortfolioDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-portfolio-detail/teacher-portfolio-detail?id=${id}`
    });
  }
});
