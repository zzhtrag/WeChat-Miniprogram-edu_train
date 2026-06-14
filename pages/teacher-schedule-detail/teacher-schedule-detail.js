// pages/teacher-schedule-detail/teacher-schedule-detail.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    scheduleId: null,
    loading: true,
    schedule: null,
    classStudents: [],
    statusMap: {
      scheduled: { text: '待上课', color: '#faad14' },
      ongoing: { text: '进行中', color: '#1890ff' },
      completed: { text: '已结课', color: '#52c41a' },
      cancelled: { text: '已取消', color: '#ff4d4f' }
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ scheduleId: options.id });
      this.loadDetail(options.id);
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  onShow() {
    if (this.data.scheduleId) {
      this.loadDetail(this.data.scheduleId);
    }
  },

  // 加载排课详情
  async loadDetail(id) {
    this.setData({ loading: true });

    try {
      const schedule = await api.get('/schedules/' + id);

      if (!schedule) {
        wx.showToast({ title: '排课不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }

      // 获取关联信息
      const course = await api.get('/courses/' + schedule.course_id);
      const classInfo = await api.get('/classes/' + schedule.class_id);
      const students = await api.get('/classes/' + schedule.class_id + '/students');

      const statusInfo = this.data.statusMap[schedule.status] || this.data.statusMap.scheduled;

      // 计算课程状态
      const now = new Date();
      const [startHour, startMin] = (schedule.start_time || '09:00').split(':').map(Number);
      const [endHour, endMin] = (schedule.end_time || '11:00').split(':').map(Number);
      const scheduleDate = new Date(schedule.date);
      const startDate = new Date(scheduleDate);
      startDate.setHours(startHour, startMin, 0);
      const endDate = new Date(scheduleDate);
      endDate.setHours(endHour, endMin, 0);

      let courseStatus = 'scheduled';
      let courseStatusText = '待上课';
      let courseStatusColor = '#faad14';

      if (schedule.status === 'cancelled') {
        courseStatus = 'cancelled';
        courseStatusText = '已取消';
        courseStatusColor = '#ff4d4f';
      } else if (schedule.status === 'completed') {
        courseStatus = 'completed';
        courseStatusText = '已结课';
        courseStatusColor = '#52c41a';
      } else if (now < startDate) {
        courseStatus = 'scheduled';
        courseStatusText = '待上课';
        courseStatusColor = '#faad14';
      } else if (now >= startDate && now <= endDate) {
        courseStatus = 'ongoing';
        courseStatusText = '进行中';
        courseStatusColor = '#1890ff';
      } else {
        courseStatus = 'completed';
        courseStatusText = '已结束';
        courseStatusColor = '#52c41a';
      }

      this.setData({
        schedule: {
          id: schedule.id,
          courseName: course?.name || '课程',
          courseId: schedule.course_id,
          className: classInfo?.name || '班级',
          classId: schedule.class_id,
          date: schedule.date,
          startTime: schedule.start_time || '09:00',
          endTime: schedule.end_time || '11:00',
          duration: schedule.duration || 2,
          room: schedule.room || '待定',
          remarks: schedule.remarks || '',
          status: courseStatus,
          statusText: courseStatusText,
          statusColor: courseStatusColor,
          createdAt: schedule.created_at || ''
        },
        classStudents: students.slice(0, 10), // 只显示前10个
        loading: false
      });
    } catch (err) {
      wx.showToast({ title: '排课不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  // 编辑排课
  onEdit() {
    wx.navigateTo({
      url: `/pages/teacher-schedule-edit/teacher-schedule-edit?id=${this.data.scheduleId}`
    });
  },

  // 取消排课
  onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这节课程吗？',
      success: (res) => {
        if (res.confirm) {
          this.doCancel();
        }
      }
    });
  },

  async doCancel() {
    try {
      await api.put('/schedules/' + this.data.scheduleId, { status: 'cancelled' });
      wx.showToast({ title: '已取消', icon: 'success' });
      this.loadDetail(this.data.scheduleId);
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 删除排课
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条排课记录吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.doDelete();
        }
      }
    });
  },

  async doDelete() {
    try {
      await api.delete('/schedules/' + this.data.scheduleId);
      wx.showToast({ title: '删除成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  // 标记已结课
  onComplete() {
    wx.showModal({
      title: '确认结课',
      content: '确定要将这节课标记为已结课吗？',
      success: (res) => {
        if (res.confirm) {
          this.doComplete();
        }
      }
    });
  },

  async doComplete() {
    try {
      await api.put('/schedules/' + this.data.scheduleId, { status: 'completed' });
      wx.showToast({ title: '已结课', icon: 'success' });
      this.loadDetail(this.data.scheduleId);
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 查看班级详情
  onViewClass() {
    const classId = this.data.schedule.classId;
    wx.navigateTo({
      url: `/pages/teacher-student-detail/teacher-student-detail?id=${classId}`
    });
  }
});
