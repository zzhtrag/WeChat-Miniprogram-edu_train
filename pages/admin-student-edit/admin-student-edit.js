const api = require('../../utils/api.js');

Page({
  data: {
    isEdit: false,
    studentId: '',
    formData: {
      name: '',
      student_no: '',
      grade: '',
      parent_name: '',
      parent_phone: '',
      address: '',
      tags: [],
      remarks: '',
      status: 'active'
    },
    grades: ['高一', '高二', '高三', '初中部'],
    tagOptions: ['活跃', '需关注', '进步明显', '学习困难', '尖子生'],
    selectedTags: [],
    allClasses: [],
    selectedClassIds: [],
    showGradePicker: false,
    loading: false,
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        studentId: options.id
      });
      this.loadStudentData();
    }
    this.loadAllClasses();
  },

  async loadAllClasses() {
    try {
      const classes = await api.get('/classes', { status: 'active' });
      this.setData({
        allClasses: (classes || []).map(c => ({ ...c, id: String(c.id) }))
      });
    } catch (err) {
      console.error('加载班级失败', err);
    }
  },

  async loadStudentData() {
    this.setData({ loading: true });

    try {
      const student = await api.get('/students/' + this.data.studentId);
      if (student) {
        this.setData({
          formData: { ...student },
          selectedTags: student.tags || [],
          selectedClassIds: (student.class_ids || []).map(String),
          loading: false
        });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  onStudentNoInput(e) {
    this.setData({
      'formData.student_no': e.detail.value
    });
  },

  onParentNameInput(e) {
    this.setData({
      'formData.parent_name': e.detail.value
    });
  },

  onParentPhoneInput(e) {
    this.setData({
      'formData.parent_phone': e.detail.value
    });
  },

  onAddressInput(e) {
    this.setData({
      'formData.address': e.detail.value
    });
  },

  onRemarksInput(e) {
    this.setData({
      'formData.remarks': e.detail.value
    });
  },

  showGradeSelect() {
    this.setData({
      showGradePicker: true
    });
  },

  hideGradeSelect() {
    this.setData({
      showGradePicker: false
    });
  },

  selectGrade(e) {
    const grade = e.currentTarget.dataset.grade;
    this.setData({
      'formData.grade': grade,
      showGradePicker: false
    });
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const { selectedTags } = this.data;
    const index = selectedTags.indexOf(tag);

    if (index > -1) {
      selectedTags.splice(index, 1);
    } else {
      selectedTags.push(tag);
    }

    this.setData({
      selectedTags: [...selectedTags],
      'formData.tags': [...selectedTags]
    });
  },

  toggleClass(e) {
    const classId = String(e.currentTarget.dataset.id);
    let { selectedClassIds } = this.data;
    const index = selectedClassIds.indexOf(classId);

    if (index > -1) {
      selectedClassIds.splice(index, 1);
    } else {
      selectedClassIds.push(classId);
    }

    this.setData({
      selectedClassIds: selectedClassIds.slice()
    });
  },

  validateForm() {
    const { formData } = this.data;

    if (!formData.name || formData.name.trim() === '') {
      wx.showToast({ title: '请输入学员姓名', icon: 'none' });
      return false;
    }

    if (!formData.student_no || formData.student_no.trim() === '') {
      wx.showToast({ title: '请输入学号', icon: 'none' });
      return false;
    }

    if (!formData.grade) {
      wx.showToast({ title: '请选择年级', icon: 'none' });
      return false;
    }

    if (!formData.parent_name || formData.parent_name.trim() === '') {
      wx.showToast({ title: '请输入家长姓名', icon: 'none' });
      return false;
    }

    if (!formData.parent_phone || formData.parent_phone.trim() === '') {
      wx.showToast({ title: '请输入家长手机号', icon: 'none' });
      return false;
    }

    if (!formData.address || formData.address.trim() === '') {
      wx.showToast({ title: '请输入家庭住址', icon: 'none' });
      return false;
    }

    return true;
  },

  async submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    const { formData, isEdit, selectedClassIds, studentId } = this.data;
    const submitData = {
      ...formData,
      tags: this.data.selectedTags,
      class_ids: selectedClassIds
    };

    try {
      if (isEdit) {
        await api.put('/students/' + studentId, submitData);
      } else {
        await api.post('/students', submitData);
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
      this.setData({ submitting: false });
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  cancel() {
    wx.navigateBack();
  }
});
