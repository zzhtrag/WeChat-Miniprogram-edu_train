const api = require('../../utils/api.js');

Page({
  data: {
    teacherId: '',
    teacher: null,
    teacherClasses: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ teacherId: options.id });
    }
    this.loadTeacherDetail();
  },

  onShow() {
    // 每次显示页面时都刷新数据
    this.loadTeacherDetail();
  },

  async loadTeacherDetail() {
    try {
      const teacher = await api.get('/teachers/' + this.data.teacherId);
      if (teacher) {
        const teacherClasses = await api.get('/teachers/' + this.data.teacherId + '/classes');

        this.setData({
          teacher,
          teacherClasses,
          loading: false
        });
      } else {
        wx.showToast({ title: '教师不存在', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 编辑教师
  editTeacher() {
    wx.navigateTo({
      url: `/pages/admin-teacher-edit/admin-teacher-edit?id=${this.data.teacherId}`
    });
  },

  // 查看班级详情
  viewClassDetail(e) {
    const classId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-class-detail/admin-class-detail?id=${classId}`
    });
  },

  // 拨打电话
  callTeacher() {
    const { teacher } = this.data;
    if (teacher && teacher.phone) {
      wx.makePhoneCall({
        phoneNumber: teacher.phone
      });
    }
  },

  // 显示更多操作
  showMoreActions() {
    const { teacher } = this.data;
    const items = teacher.status === 'active'
      ? ['编辑信息', '设为禁用', '删除教师']
      : ['编辑信息', '设为启用', '删除教师'];

    wx.showActionSheet({
      itemList: items,
      itemColor: '#00cccc',
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.editTeacher();
            break;
          case 1:
            this.toggleStatus();
            break;
          case 2:
            this.deleteTeacher();
            break;
        }
      }
    });
  },

  async toggleStatus() {
    const { teacher } = this.data;
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active';

    try {
      await api.put('/teachers/' + this.data.teacherId, { status: newStatus });
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.loadTeacherDetail();
    } catch (err) {
      wx.showToast({ title: '状态更新失败', icon: 'none' });
    }
  },

  deleteTeacher() {
    const { teacher } = this.data;
    const that = this;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除教师"${teacher.name}"吗？删除后不可恢复。`,
      confirmColor: '#ff4d4f',
      async success(res) {
        if (res.confirm) {
          try {
            await api.delete('/teachers/' + that.data.teacherId);
            wx.showToast({ title: '删除成功', icon: 'success' });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadTeacherDetail();
    wx.stopPullDownRefresh();
  }
});
