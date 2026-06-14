const api = require('../../utils/api.js');

Page({
  data: {
    // 学员列表
    students: [],
    // 统计数据
    studentStats: {
      total: 0,
      active: 0,
      inactive: 0
    },
    // 筛选状态
    filterStatus: '',
    filterGrade: '',
    keyword: '',
    // 筛选弹窗
    showFilterModal: false,
    // 操作菜单
    showActionSheet: false,
    currentStudent: {},
    currentStudentId: '',
    // 加载状态
    loading: false,
    // 空状态
    isEmpty: false
  },

  onLoad(options) {
    this.loadStudents();
  },

  onShow() {
    this.loadStudents();
  },

  // 加载学员列表
  async loadStudents() {
    this.setData({ loading: true });

    try {
      const app = getApp();
      const userInfo = app.globalData.userInfo;
      const teacher = await api.get('/teachers/user/' + (userInfo?.id || ''));
      const currentTeacherId = teacher?.id || '';

      // 获取教师所带班级的全部学生
      const allStudents = await api.get('/teachers/' + currentTeacherId + '/students');

      // 计算统计数据
      const stats = {
        total: allStudents.length,
        active: allStudents.filter(s => s.status === 'active').length,
        inactive: allStudents.filter(s => s.status === 'inactive').length
      };

      // 客户端筛选
      let list = allStudents;
      if (this.data.filterStatus) {
        list = list.filter(s => s.status === this.data.filterStatus);
      }
      if (this.data.filterGrade) {
        list = list.filter(s => s.grade === this.data.filterGrade);
      }
      if (this.data.keyword) {
        const kw = this.data.keyword.toLowerCase();
        list = list.filter(s => (s.name && s.name.toLowerCase().includes(kw)) || (s.phone && s.phone.includes(kw)));
      }

      this.setData({
        students: list,
        studentStats: stats,
        isEmpty: list.length === 0,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadStudents();
    wx.stopPullDownRefresh();
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 搜索确认
  onSearch() {
    this.loadStudents();
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      keyword: ''
    });
    this.loadStudents();
  },

  // 显示筛选弹窗
  showFilter() {
    this.setData({
      showFilterModal: true
    });
  },

  // 隐藏筛选弹窗
  hideFilter() {
    this.setData({
      showFilterModal: false
    });
  },

  // 设置状态筛选
  setFilterStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      filterStatus: status
    });
  },

  // 设置年级筛选
  setFilterGrade(e) {
    const grade = e.currentTarget.dataset.grade;
    this.setData({
      filterGrade: grade
    });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      filterStatus: '',
      filterGrade: ''
    });
  },

  // 确认筛选
  confirmFilter() {
    this.hideFilter();
    this.loadStudents();
  },

  // 查看学员详情
  viewStudentDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-student-detail/teacher-student-detail?id=${id}`
    });
  },

  // 显示操作菜单
  showActions(e) {
    const id = e.currentTarget.dataset.id;
    const student = this.data.students.find(s => s.id === id);
    this.setData({
      showActionSheet: true,
      currentStudent: student,
      currentStudentId: id
    });
  },

  // 隐藏操作菜单
  hideActionSheet() {
    this.setData({
      showActionSheet: false
    });
  },

  // 切换学员状态
  async toggleStudentStatus() {
    const id = this.data.currentStudentId;
    const newStatus = this.data.currentStudent.status === 'active' ? 'inactive' : 'active';

    try {
      await api.put('/students/' + id + '/status', { status: newStatus });
      wx.showToast({
        title: newStatus === 'active' ? '已设为在读' : '已设为休学',
        icon: 'success'
      });
      this.hideActionSheet();
      this.loadStudents();
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 删除学员
  deleteStudent() {
    const name = this.data.currentStudent.name;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除学员"${name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doDelete();
        }
      }
    });
  },

  // 执行删除
  async doDelete() {
    const studentId = this.data.currentStudentId;
    const classId = this.data.currentStudent.class_id;

    try {
      await api.delete('/classes/' + classId + '/students/' + studentId);
      wx.showToast({
        title: '已移除',
        icon: 'success'
      });
      this.hideActionSheet();
      this.loadStudents();
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 添加学员
  addStudent() {
    wx.showToast({
      title: '请联系管理员添加学员',
      icon: 'none'
    });
  },

  // 查看考勤详情
  viewAttendance(e) {
    const studentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-student-detail/teacher-student-detail?id=${studentId}&tab=attendance`
    });
  },

  // 查看成绩
  viewGrades(e) {
    const studentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-student-detail/teacher-student-detail?id=${studentId}&tab=grades`
    });
  },

  // 查看课程
  viewCourses(e) {
    const studentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher-student-detail/teacher-student-detail?id=${studentId}&tab=courses`
    });
  }
});
