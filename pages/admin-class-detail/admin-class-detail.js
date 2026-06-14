const api = require('../../utils/api.js');

Page({
  data: {
    classId: '',
    classInfo: null,
    courseInfo: null,
    teacherInfo: null,
    students: [],
    schedules: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ classId: options.id });
      this.loadClassDetail();
    }
  },

  async loadClassDetail() {
    try {
      const classInfo = await api.get('/classes/' + this.data.classId);
      if (classInfo) {
        const courseInfo = await api.get('/courses/' + classInfo.course_id);
        const teacherInfo = await api.get('/teachers/' + classInfo.teacher_id);
        const students = await api.get('/classes/' + classInfo.id + '/students');
        const schedules = await api.get('/classes/' + classInfo.id + '/schedules');

        this.setData({
          classInfo,
          courseInfo,
          teacherInfo: { ...teacherInfo, subjectsLabel: (teacherInfo.subjects || []).join('、') },
          students,
          schedules,
          loading: false
        });
      }
    } catch (err) {
      wx.showToast({ title: '班级不存在', icon: 'none' });
      setTimeout(() => { wx.navigateBack(); }, 1500);
    }
  },

  // 编辑班级
  editClass() {
    wx.navigateTo({
      url: `/pages/admin-class-edit/admin-class-edit?id=${this.data.classId}`
    });
  },

  // 查看学员详情
  viewStudentDetail(e) {
    const studentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-student-detail/admin-student-detail?id=${studentId}`
    });
  },

  // 查看教师详情
  viewTeacherDetail() {
    const { teacherInfo } = this.data;
    if (teacherInfo) {
      wx.navigateTo({
        url: `/pages/admin-teacher-detail/admin-teacher-detail?id=${teacherInfo.id}`
      });
    }
  },

  // 显示更多操作
  showMoreActions() {
    const { classInfo } = this.data;
    const items = classInfo.status === 'active'
      ? ['编辑信息', '添加学员', '设为已结束', '删除班级']
      : ['编辑信息', '添加学员', '设为进行中', '删除班级'];

    wx.showActionSheet({
      itemList: items,
      itemColor: '#722ed1',
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.editClass();
            break;
          case 1:
            this.addStudent();
            break;
          case 2:
            this.toggleStatus();
            break;
          case 3:
            this.deleteClass();
            break;
        }
      }
    });
  },

  // ==================== 接口标记 ====================
  // API: GET /pages/admin-class-edit/class-edit?id=xxx&action=enroll
  // 功能: 跳转到学员选择页面添加学员
  // ==================== 接口标记 ====================
  addStudent() {
    wx.navigateTo({
      url: `/pages/admin-class-enroll/admin-class-enroll?classId=${this.data.classId}`
    });
  },

  async toggleStatus() {
    const { classInfo } = this.data;
    const newStatus = classInfo.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put('/classes/' + classInfo.id + '/status', { status: newStatus });
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.loadClassDetail();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteClass() {
    const { classInfo } = this.data;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除班级"${classInfo.name}"吗？删除后不可恢复。`,
      confirmColor: '#ff4d4f',
      async success(res) {
        if (res.confirm) {
          try {
            await api.delete('/classes/' + classInfo.id);
            wx.showToast({ title: '删除成功', icon: 'success' });
            setTimeout(() => { wx.navigateBack(); }, 1500);
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadClassDetail();
    wx.stopPullDownRefresh();
  }
});
