// pages/teacher-schedule-edit/teacher-schedule-edit.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    // 是否是编辑模式
    isEdit: false,
    scheduleId: null,
    // 是否批量日期模式
    isBatchMode: false,
    batchDates: [],
    // 班级列表
    classList: [],
    // 选中班级
    selectedClassIndex: 0,
    // 时间选项
    startTimeOptions: [],
    endTimeOptions: [],
    // 教室列表
    roomList: ['101', '102', '103', '201', '202', '203', '301', '302', '303', '401', '402', '403'],
    // picker 索引
    startTimeIndex: 0,
    endTimeIndex: 0,
    roomIndex: 0,
    // 表单数据
    formData: {
      classId: '',
      courseName: '',
      className: '',
      date: '',
      startTime: '09:00',
      endTime: '11:00',
      room: '',
      duration: 2,
      remarks: ''
    },
    // 验证错误
    errors: {},
    // 状态
    loading: false,
    submitting: false
  },

  onLoad(options) {
    // 初始化时间选项
    this.initTimeOptions();

    if (options.id) {
      this.setData({
        isEdit: true,
        scheduleId: options.id
      });
      wx.setNavigationBarTitle({ title: '编辑排课' });
      this.loadSchedule(options.id);
    } else {
      // 检查是否批量日期模式
      if (options.dates) {
        const batchDates = options.dates.split(',').filter(d => d);
        this.setData({
          isBatchMode: true,
          batchDates,
          'formData.date': batchDates[0] || ''
        });
        wx.setNavigationBarTitle({ title: '批量排课' });
      } else {
        wx.setNavigationBarTitle({ title: '添加排课' });
      }
      this.loadClassOptions();
    }
  },

  // 初始化时间选项
  initTimeOptions() {
    const hours = [];
    const minutes = ['00', '30'];

    for (let h = 7; h <= 21; h++) {
      hours.push(h < 10 ? '0' + h : '' + h);
    }

    const startOptions = [];
    const endOptions = [];

    hours.forEach(h => {
      minutes.forEach(m => {
        startOptions.push(`${h}:${m}`);
        endOptions.push(`${h}:${m}`);
      });
    });

    this.setData({
      startTimeOptions: startOptions,
      endTimeOptions: endOptions,
      startTimeIndex: startOptions.indexOf('09:00'),
      endTimeIndex: endOptions.indexOf('11:00')
    });
  },

  // 加载班级选项
  async loadClassOptions() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      // 通过 user_id 查找教师记录
      const teacher = await api.get('/teachers/user/' + (userInfo?.id || ''));
      if (!teacher) return;

      // 直接使用 getTeacherClasses 返回的数据（已包含 course_name）
      const classes = await api.get('/teachers/' + teacher.id + '/classes');
      const classOptions = classes.map(c => ({
        id: c.id,
        name: c.name,
        courseName: c.course_name || '',
        courseId: c.course_id
      }));

      this.setData({ classList: classOptions });

      if (this.data.isEdit) {
        // 编辑模式：回设选中班级的 index
        const currentClassId = this.data.formData.classId;
        const idx = classOptions.findIndex(c => c.id === currentClassId);
        if (idx >= 0) {
          this.setData({ selectedClassIndex: idx });
        }
      } else if (classOptions.length > 0) {
        this.setData({
          selectedClassIndex: 0,
          'formData.classId': classOptions[0].id,
          'formData.courseName': classOptions[0].courseName,
          'formData.className': classOptions[0].name
        });
      }
    } catch (err) {
    }
  },

  // 加载排课详情
  async loadSchedule(id) {
    this.setData({ loading: true });

    try {
      const schedule = await api.get('/schedules/' + id);

      if (!schedule) {
        wx.showToast({ title: '排课不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }

      const startTime = schedule.start_time || '09:00';
      const endTime = schedule.end_time || '11:00';
      const room = schedule.room || '';

      this.setData({
        'formData.classId': schedule.class_id,
        'formData.courseName': schedule.course_name || '',
        'formData.className': schedule.class_name || '',
        'formData.date': schedule.date,
        'formData.startTime': startTime,
        'formData.endTime': endTime,
        'formData.room': room,
        'formData.duration': schedule.duration || 2,
        'formData.remarks': schedule.remarks || '',
        startTimeIndex: this.data.startTimeOptions.indexOf(startTime),
        endTimeIndex: this.data.endTimeOptions.indexOf(endTime),
        roomIndex: this.data.roomList.indexOf(room),
        loading: false
      });

      this.loadClassOptions();
    } catch (err) {
      wx.showToast({ title: '排课不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  // 选择班级
  onClassChange(e) {
    const index = e.detail.value;
    const selected = this.data.classList[index];

    if (selected) {
      this.setData({
        selectedClassIndex: index,
        'formData.classId': selected.id,
        'formData.courseName': selected.courseName,
        'formData.className': selected.name,
        errors: { ...this.data.errors, classId: '' }
      });
    }
  },

  // 选择日期
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value,
      errors: { ...this.data.errors, date: '' }
    });
  },

  // 选择开始时间
  onStartTimeChange(e) {
    const index = e.detail.value;
    const startTime = this.data.startTimeOptions[index];

    // 自动计算结束时间
    const startHour = parseInt(startTime.split(':')[0]);
    let endHour = startHour + 2;
    if (endHour > 21) endHour = 21;
    const endTime = `${endHour < 10 ? '0' + endHour : endHour}:00`;

    this.setData({
      startTimeIndex: index,
      'formData.startTime': startTime,
      'formData.endTime': endTime,
      endTimeIndex: this.data.endTimeOptions.indexOf(endTime),
      'formData.duration': 2,
      errors: { ...this.data.errors, startTime: '' }
    });
  },

  // 选择结束时间
  onEndTimeChange(e) {
    const index = e.detail.value;
    const endTime = this.data.endTimeOptions[index];
    const startTime = this.data.formData.startTime;

    // 计算时长
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const duration = (eh - sh) * 60 + (em - sm);

    this.setData({
      endTimeIndex: index,
      'formData.endTime': endTime,
      'formData.duration': duration > 0 ? Math.ceil(duration / 60) : 1,
      errors: { ...this.data.errors, endTime: '' }
    });
  },

  // 选择教室
  onRoomChange(e) {
    const index = e.detail.value;
    this.setData({
      roomIndex: index,
      'formData.room': this.data.roomList[index]
    });
  },

  // 备注输入
  onRemarksInput(e) {
    this.setData({
      'formData.remarks': e.detail.value
    });
  },

  // 表单验证
  validate() {
    const { classId, date, startTime, endTime } = this.data.formData;
    const errors = {};

    if (!classId) {
      errors.classId = '请选择上课班级';
    }

    if (!this.data.isBatchMode && !date) {
      errors.date = '请选择上课日期';
    }

    if (this.data.isBatchMode && this.data.batchDates.length === 0) {
      errors.date = '请选择至少一个日期';
    }

    if (!startTime) {
      errors.startTime = '请选择开始时间';
    }

    if (!endTime) {
      errors.endTime = '请选择结束时间';
    }

    // 检查时间是否合理
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      if (eh < sh || (eh === sh && em <= sm)) {
        errors.endTime = '结束时间必须晚于开始时间';
      }
    }

    this.setData({ errors });

    return Object.keys(errors).length === 0;
  },

  // 保存
  async onSave() {
    if (!this.validate()) {
      return;
    }

    this.setData({ submitting: true });

    const { classId, startTime, endTime, room, remarks } = this.data.formData;
    const classInfo = this.data.classList.find(c => c.id === classId);

    try {
      if (this.data.isEdit) {
        // 编辑模式
        await api.put('/schedules/' + this.data.scheduleId, {
          class_id: classId,
          course_id: classInfo?.courseId,
          date: this.data.formData.date,
          start_time: startTime,
          end_time: endTime,
          room,
          duration: this.data.formData.duration,
          remarks
        });
        wx.showToast({ title: '更新成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      } else if (this.data.isBatchMode) {
        // 批量模式 - 为每个日期创建排课
        const results = await Promise.all(this.data.batchDates.map(date =>
          api.post('/schedules', {
            class_id: classId,
            course_id: classInfo?.courseId,
            date,
            start_time: startTime,
            end_time: endTime,
            room,
            duration: this.data.formData.duration,
            remarks,
            status: 'scheduled'
          }).catch(() => null)
        ));
        const successCount = results.filter(r => r !== null).length;
        wx.showToast({ title: `成功创建${successCount}条排课`, icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      } else {
        // 单条创建
        await api.post('/schedules', {
          class_id: classId,
          course_id: classInfo?.courseId,
          date: this.data.formData.date,
          start_time: startTime,
          end_time: endTime,
          room,
          duration: this.data.formData.duration,
          remarks,
          status: 'scheduled'
        });
        wx.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 批量模式：增加日期
  onAddMoreDates() {
    const currentDates = this.data.batchDates;
    wx.navigateTo({
      url: `/pages/teacher-schedule/teacher-schedule`,
      events: {
        acceptBatchDates: (data) => {
          const newDates = [...new Set([...currentDates, ...data.dates])].sort();
          this.setData({
            batchDates: newDates,
            'formData.date': newDates[0] || ''
          });
        }
      }
    });
  },

  // 批量模式：移除某个日期
  onRemoveBatchDate(e) {
    const date = e.currentTarget.dataset.date;
    const batchDates = this.data.batchDates.filter(d => d !== date);
    this.setData({
      batchDates,
      'formData.date': batchDates[0] || ''
    });
  },

  // 删除
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条排课记录吗？',
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
  }
});
