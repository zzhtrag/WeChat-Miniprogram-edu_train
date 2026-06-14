const api = require('../../utils/api.js');

Page({
  data: {
    isEdit: false,
    classId: '',
    formData: {
      name: '',
      course_id: '',
      teacher_id: '',
      room: '',
      capacity: 30,
      start_date: '',
      end_date: '',
      remarks: '',
      status: 'active'
    },
    courses: [],
    teachers: [],
    showCoursePicker: false,
    showTeacherPicker: false,
    showDatePicker: false,
    datePickerType: 'start',
    loading: false,
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        classId: options.id
      });
      this.loadOptions().then(() => this.loadClassData());
    } else {
      this.loadOptions();
      // 设置默认日期
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.setMonth(today.getMonth() + 3)).toISOString().split('T')[0];
      this.setData({
        'formData.start_date': startDate,
        'formData.end_date': endDate
      });
    }
  },

  async loadOptions() {
    try {
      const [courses, teachers] = await Promise.all([
        api.get('/courses'),
        api.get('/teachers')
      ]);
      this.setData({
        courses: courses.filter(c => c.is_open && c.status === 'active'),
        teachers: teachers.filter(t => t.status === 'active').map(t => ({
          ...t,
          subjectsLabel: (t.subjects || []).join('、')
        }))
      });
    } catch (err) {
      wx.showToast({ title: '加载选项失败', icon: 'none' });
    }
  },

  async loadClassData() {
    this.setData({ loading: true });
    try {
      const classInfo = await api.get('/classes/' + this.data.classId);
      if (classInfo) {
        // 如果接口没返回 course_name/teacher_name，从已加载列表中查找
        const course = this.data.courses.find(c => c.id === classInfo.course_id);
        const teacher = this.data.teachers.find(t => t.id === classInfo.teacher_id);

        this.setData({
          formData: {
            ...classInfo,
            course_name: classInfo.course_name || (course ? course.name : ''),
            teacher_name: classInfo.teacher_name || (teacher ? teacher.name : '')
          },
          loading: false
        });
      }
    } catch (err) {
      wx.showToast({ title: '加载班级信息失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  // 班级名称输入
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  // 教室输入
  onRoomInput(e) {
    this.setData({
      'formData.room': e.detail.value
    });
  },

  // 容量输入
  onCapacityInput(e) {
    this.setData({
      'formData.capacity': parseInt(e.detail.value) || 30
    });
  },

  // 备注输入
  onRemarksInput(e) {
    this.setData({
      'formData.remarks': e.detail.value
    });
  },

  // 显示课程选择器
  showCourseSelect() {
    this.setData({
      showCoursePicker: true
    });
  },

  // 隐藏课程选择器
  hideCourseSelect() {
    this.setData({
      showCoursePicker: false
    });
  },

  // 选择课程
  selectCourse(e) {
    const courseId = e.currentTarget.dataset.id;
    const course = this.data.courses.find(c => c.id === courseId);
    if (course) {
      this.setData({
        'formData.course_id': courseId,
        'formData.course_name': course.name,
        showCoursePicker: false
      });
    }
  },

  // 显示教师选择器
  showTeacherSelect() {
    this.setData({
      showTeacherPicker: true
    });
  },

  // 隐藏教师选择器
  hideTeacherSelect() {
    this.setData({
      showTeacherPicker: false
    });
  },

  // 选择教师
  selectTeacher(e) {
    const teacherId = e.currentTarget.dataset.id;
    const teacher = this.data.teachers.find(t => t.id === teacherId);
    if (teacher) {
      this.setData({
        'formData.teacher_id': teacherId,
        'formData.teacher_name': teacher.name,
        showTeacherPicker: false
      });
    }
  },

  // 显示日期选择
  showDatePickerSelect(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      showDatePicker: true,
      datePickerType: type
    });
  },

  // 隐藏日期选择
  hideDatePicker() {
    this.setData({
      showDatePicker: false
    });
  },

  // 日期选择
  onDateChange(e) {
    const date = e.detail.value;
    const { datePickerType } = this.data;
    this.setData({
      [`formData.${datePickerType}_date`]: date,
      showDatePicker: false
    });
  },

  // 验证表单
  validateForm() {
    const { formData } = this.data;

    if (!formData.name || formData.name.trim() === '') {
      wx.showToast({ title: '请输入班级名称', icon: 'none' });
      return false;
    }

    if (!formData.course_id) {
      wx.showToast({ title: '请选择课程', icon: 'none' });
      return false;
    }

    if (!formData.teacher_id) {
      wx.showToast({ title: '请选择任课教师', icon: 'none' });
      return false;
    }

    if (!formData.room || formData.room.trim() === '') {
      wx.showToast({ title: '请输入上课地点', icon: 'none' });
      return false;
    }

    if (!formData.capacity || formData.capacity < 1) {
      wx.showToast({ title: '请输入正确的班级容量', icon: 'none' });
      return false;
    }

    if (!formData.start_date) {
      wx.showToast({ title: '请选择开课日期', icon: 'none' });
      return false;
    }

    if (!formData.end_date) {
      wx.showToast({ title: '请选择结课日期', icon: 'none' });
      return false;
    }

    if (formData.start_date > formData.end_date) {
      wx.showToast({ title: '结课日期不能早于开课日期', icon: 'none' });
      return false;
    }

    return true;
  },

  async submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    const { formData, isEdit } = this.data;
    const submitData = { ...formData };
    delete submitData.course_name;
    delete submitData.teacher_name;

    try {
      if (isEdit) {
        await api.put('/classes/' + this.data.classId, submitData);
      } else {
        await api.post('/classes', submitData);
      }

      wx.showToast({
        title: isEdit ? '更新成功' : '创建成功',
        icon: 'success'
      });

      this.setData({ submitting: false });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
      this.setData({ submitting: false });
    }
  },

  // 取消返回
  cancel() {
    wx.navigateBack();
  }
});
