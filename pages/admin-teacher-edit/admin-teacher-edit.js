const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    isEdit: false,
    teacherId: '',
    formData: {
      name: '',
      phone: '',
      email: '',
      subjects: [],
      education: '',
      school: '',
      entry_date: '',
      status: 'active'
    },
    subjects: config.subjects,
    selectedSubjects: [],
    subjectSelected: {},
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        teacherId: options.id
      });
      this.loadTeacherData();
    }
  },

  // 加载教师数据
  async loadTeacherData() {
    try {
      const teacher = await api.get('/teachers/' + this.data.teacherId);
      if (teacher) {
        this.setData({
          formData: {
            name: teacher.name,
            phone: teacher.phone || '',
            email: teacher.email || '',
            subjects: teacher.subjects || [],
            education: teacher.education || '',
            school: teacher.school || '',
            entry_date: teacher.entry_date || '',
            status: teacher.status || 'active'
          },
          selectedSubjects: teacher.subjects || [],
          subjectSelected: (teacher.subjects || []).reduce((map, s) => { map[s] = true; return map; }, {})
        });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 输入处理
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      'formData.email': e.detail.value
    });
  },

  onEducationInput(e) {
    this.setData({
      'formData.education': e.detail.value
    });
  },

  onSchoolInput(e) {
    this.setData({
      'formData.school': e.detail.value
    });
  },

  onEntryDateChange(e) {
    this.setData({
      'formData.entry_date': e.detail.value
    });
  },

  // 科目选择
  onSubjectChange(e) {
    const index = e.currentTarget.dataset.index;
    const subject = this.data.subjects[index];
    const selected = this.data.selectedSubjects;
    const selectedMap = this.data.subjectSelected;

    if (selected.includes(subject)) {
      const newMap = { ...selectedMap };
      delete newMap[subject];
      this.setData({
        selectedSubjects: selected.filter(s => s !== subject),
        subjectSelected: newMap
      });
    } else {
      this.setData({
        selectedSubjects: [...selected, subject],
        subjectSelected: { ...selectedMap, [subject]: true }
      });
    }
  },

  // 保存
  async saveTeacher() {
    const { formData, selectedSubjects, isEdit } = this.data;

    // 验证
    if (!formData.name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (selectedSubjects.length === 0) {
      wx.showToast({ title: '请选择教授科目', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    const teacherData = {
      ...formData,
      subjects: selectedSubjects
    };

    try {
      if (isEdit) {
        await api.put('/teachers/' + this.data.teacherId, teacherData);
        wx.showToast({ title: '更新成功', icon: 'success' });
      } else {
        await api.post('/teachers', teacherData);
        wx.showToast({ title: '添加成功', icon: 'success' });
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  // 取消
  cancel() {
    wx.navigateBack();
  }
});
