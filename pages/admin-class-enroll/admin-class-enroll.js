// pages/admin-class-enroll/admin-class-enroll.js
const api = require('../../utils/api.js');

Page({
  data: {
    classId: '',
    classInfo: null,
    currentStudentCount: 0,
    existingStudents: [],
    availableStudents: [],
    filteredAvailable: [],
    selectedIds: [],
    keyword: '',
    loading: true
  },

  onLoad(options) {
    if (options.classId) {
      this.setData({ classId: options.classId });
      this.loadData();
    }
  },

  async loadData() {
    const classInfo = await api.get('/classes/' + this.data.classId);
    if (!classInfo) {
      wx.showToast({ title: '班级不存在', icon: 'none' });
      return;
    }

    const existingStudents = await api.get('/classes/' + this.data.classId + '/students');
    const existingIds = existingStudents.map(s => s.id);

    const allStudents = await api.get('/students');
    const availableStudents = allStudents.filter(s =>
      s.status === 'active' && !existingIds.includes(s.id)
    );

    this.setData({
      classInfo,
      currentStudentCount: existingStudents.length,
      existingStudents,
      availableStudents,
      filteredAvailable: availableStudents,
      loading: false
    });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    const keyword = this.data.keyword.toLowerCase();
    const filtered = keyword
      ? this.data.availableStudents.filter(s =>
          s.name.toLowerCase().includes(keyword) ||
          s.student_no.toLowerCase().includes(keyword)
        )
      : this.data.availableStudents;
    this.setData({ filteredAvailable: filtered });
  },

  toggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    let selectedIds = [...this.data.selectedIds];
    const idx = selectedIds.indexOf(id);
    if (idx >= 0) {
      selectedIds.splice(idx, 1);
    } else {
      selectedIds.push(id);
    }
    this.setData({ selectedIds });
  },

  async confirmAdd() {
    const { selectedIds, classId } = this.data;
    if (selectedIds.length === 0) return;

    try {
      for (const studentId of selectedIds) {
        await api.post('/enrollments', {
          student_id: studentId,
          class_id: classId,
          course_id: this.data.classInfo.course_id
        });
      }

      wx.showToast({ title: `成功添加${selectedIds.length}名学员`, icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (err) {
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  }
});
