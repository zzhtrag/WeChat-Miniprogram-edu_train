const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    isEdit: false,
    courseId: '',
    formData: {
      name: '',
      subject: '',
      description: '',
      textbook: '',
      capacity: '',
      is_open: true,
      status: 'active'
    },
    subjectOptions: config.subjects,
    subjectIndex: 0,
    loading: false,
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, courseId: options.id });
      wx.setNavigationBarTitle({ title: '编辑课程' });
      this.loadCourse(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '新建课程' });
    }
  },

  async loadCourse(id) {
    this.setData({ loading: true });
    try {
      const course = await api.get('/courses/' + id);
      if (course) {
        const subjectIndex = this.data.subjectOptions.indexOf(course.subject);
        this.setData({
          formData: {
            name: course.name,
            subject: course.subject,
            description: course.description || '',
            textbook: course.textbook || '',
            capacity: course.capacity ? String(course.capacity) : '',
            is_open: course.is_open,
            status: course.status
          },
          subjectIndex: subjectIndex >= 0 ? subjectIndex : 0,
          loading: false
        });
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value });
  },

  onSubjectChange(e) {
    const index = e.detail.value;
    this.setData({ subjectIndex: index, 'formData.subject': this.data.subjectOptions[index] });
  },

  onDescriptionInput(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  onTextbookInput(e) {
    this.setData({ 'formData.textbook': e.detail.value });
  },

  onCapacityInput(e) {
    this.setData({ 'formData.capacity': e.detail.value });
  },

  onOpenChange(e) {
    this.setData({ 'formData.is_open': e.detail.value.length > 0 });
  },

  validate() {
    const { name, subject } = this.data.formData;
    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入课程名称', icon: 'none' });
      return false;
    }
    if (!subject) {
      wx.showToast({ title: '请选择科目', icon: 'none' });
      return false;
    }
    return true;
  },

  async submit() {
    if (!this.validate()) return;

    this.setData({ submitting: true });

    const { formData, isEdit, courseId } = this.data;
    const submitData = {
      name: formData.name.trim(),
      subject: formData.subject,
      description: formData.description.trim() || null,
      textbook: formData.textbook.trim() || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      is_open: formData.is_open,
      status: formData.status
    };

    try {
      if (isEdit) {
        await api.put('/courses/' + courseId, submitData);
      } else {
        await api.post('/courses', submitData);
      }

      wx.showToast({ title: isEdit ? '更新成功' : '创建成功', icon: 'success' });
      this.setData({ submitting: false });

      setTimeout(() => { wx.navigateBack(); }, 1500);
    } catch (err) {
      this.setData({ submitting: false });
    }
  },

  cancel() {
    wx.navigateBack();
  }
});
