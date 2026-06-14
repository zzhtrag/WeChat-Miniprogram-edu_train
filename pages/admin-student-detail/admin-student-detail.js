const api = require('../../utils/api.js');

Page({
  data: {
    studentId: '',
    student: null,
    parentInfo: null,
    enrolledClasses: [],
    recentGrades: [],
    recentAttendance: [],
    recentHomework: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ studentId: options.id });
      this.loadStudentDetail();
    }
  },

  async loadStudentDetail() {
    try {
      const student = await api.get('/students/' + this.data.studentId);
      if (student) {
        const parentInfo = await api.get('/parents/' + student.parent_id);
        const enrolledClasses = await api.get('/students/' + student.id + '/classes');
        const recentGrades = (await api.get('/grades', { student_id: student.id })).slice(0, 5);
        const recentAttendance = (await api.get('/attendances', { student_id: student.id })).slice(0, 5);
        const recentHomework = (await api.get('/students/' + student.id + '/homework')).slice(0, 5);

        this.setData({
          student,
          parentInfo,
          enrolledClasses,
          recentGrades,
          recentAttendance,
          recentHomework,
          loading: false
        });
      } else {
        wx.showToast({ title: '学员不存在', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
    }
  },

  async getStudentGrades(studentId) {
    try {
      return await api.get('/students/' + studentId + '/grades');
    } catch (err) {
      return [];
    }
  },

  async getStudentAttendance(studentId) {
    try {
      return await api.get('/students/' + studentId + '/attendances');
    } catch (err) {
      return [];
    }
  },

  async getStudentHomework(studentId) {
    try {
      return await api.get('/students/' + studentId + '/homework');
    } catch (err) {
      return [];
    }
  },

  editStudent() {
    wx.navigateTo({
      url: `/pages/admin-student-edit/admin-student-edit?id=${this.data.studentId}`
    });
  },

  viewClassDetail(e) {
    const classId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-class-detail/admin-class-detail?id=${classId}`
    });
  },

  callParent() {
    const { parentInfo } = this.data;
    if (parentInfo && parentInfo.phone) {
      wx.makePhoneCall({
        phoneNumber: parentInfo.phone
      });
    }
  },

  showMoreActions() {
    const { student } = this.data;
    const items = student.status === 'active'
      ? ['编辑信息', '设为休学', '删除学员']
      : ['编辑信息', '设为在读', '删除学员'];

    wx.showActionSheet({
      itemList: items,
      itemColor: '#00cccc',
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.editStudent();
            break;
          case 1:
            this.toggleStatus();
            break;
          case 2:
            this.deleteStudent();
            break;
        }
      }
    });
  },

  async toggleStatus() {
    const { student } = this.data;
    const newStatus = student.status === 'active' ? 'inactive' : 'active';

    try {
      await api.put('/students/' + student.id + '/status', { status: newStatus });
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.loadStudentDetail();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteStudent() {
    const { student } = this.data;
    const that = this;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除学员"${student.name}"吗？删除后不可恢复。`,
      confirmColor: '#ff4d4f',
      success(res) {
        if (res.confirm) {
          api.delete('/students/' + student.id).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }).catch(err => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadStudentDetail();
    wx.stopPullDownRefresh();
  }
});
