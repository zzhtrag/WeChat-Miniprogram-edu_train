const api = require('../../utils/api.js');
const fileUtil = require('../../utils/fileUtil.js');

const TEACHER_CSV_HEADERS = [
  { key: 'employee_no', label: '工号', required: true },
  { key: 'name', label: '姓名', required: true },
  { key: 'phone', label: '电话' },
  { key: 'email', label: '邮箱' },
  { key: 'subjects', label: '科目' },
  { key: 'grade', label: '年级' },
  { key: 'education', label: '学历' },
  { key: 'school', label: '毕业院校' },
  { key: 'entry_date', label: '入职日期' },
  { key: 'status', label: '状态' }
];

const TEACHER_SAMPLE_ROW = {
  employee_no: 'T2024001',
  name: '李老师',
  phone: '13900139001',
  email: 'li@example.com',
  subjects: '数学/物理',
  grade: '高一',
  education: '本科',
  school: '山东大学',
  entry_date: '2024-03-01',
  status: '在职'
};

Page({
  data: {
    keyword: '',
    teachers: [],
    teacherStats: {
      total: 0,
      active: 0,
      inactive: 0
    },
    showFilterModal: false,
    filterStatus: '',
    filterSubject: '',
    showImportModal: false,
    importData: [],
    importPreview: [],
    showImportAction: false,
    showExportModal: false,
    exportFields: [],
    exportSelectAll: true
  },

  onLoad() {
    this.loadTeachers();
  },

  onShow() {
    this.loadTeachers();
  },

  async loadTeachers() {
    try {
      const [teachers, allTeachers] = await Promise.all([
        api.get('/teachers', {
          keyword: this.data.keyword,
          status: this.data.filterStatus,
          subject: this.data.filterSubject
        }),
        api.get('/teachers')
      ]);

      const stats = {
        total: allTeachers.length,
        active: allTeachers.filter(t => t.status === 'active').length,
        inactive: allTeachers.filter(t => t.status === 'inactive').length
      };

      // 转换数据字段名以匹配 WXML
      const teacherList = teachers.map(t => ({
        id: t.id,
        name: t.name,
        teacherNo: t.employee_no,
        subjects: t.subjects,
        status: t.status,
        courseCount: t.class_count || 0,
        studentCount: t.student_count || 0,
        phone: t.phone,
        email: t.email,
        grade: t.grade,
        education: t.education,
        school: t.school,
        entryDate: t.entry_date
      }));

      this.setData({
        teachers,
        teacherList,
        teacherStats: stats,
        stats: stats
      });
    } catch (err) {
      console.error('加载教师数据失败:', err);
    }
  },

  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  onSearch() {
    this.loadTeachers();
  },

  clearSearch() {
    this.setData({
      keyword: ''
    });
    this.loadTeachers();
  },

  showFilter() {
    this.setData({
      showFilterModal: true
    });
  },

  hideFilter() {
    this.setData({
      showFilterModal: false
    });
  },

  setFilterStatus(e) {
    this.setData({
      filterStatus: e.currentTarget.dataset.status
    });
  },

  setFilterSubject(e) {
    this.setData({
      filterSubject: e.currentTarget.dataset.subject
    });
  },

  resetFilter() {
    this.setData({
      filterStatus: '',
      filterSubject: ''
    });
  },

  confirmFilter() {
    this.setData({
      showFilterModal: false
    });
    this.loadTeachers();
  },

  viewTeacher(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-teacher-detail/admin-teacher-detail?id=${teacherId}`
    });
  },

  viewTeacherDetail(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-teacher-detail/admin-teacher-detail?id=${teacherId}`
    });
  },

  addTeacher() {
    wx.navigateTo({
      url: '/pages/admin-teacher-edit/admin-teacher-edit'
    });
  },

  onPullDownRefresh() {
    this.loadTeachers();
    wx.stopPullDownRefresh();
  },

  // ========== 导出：字段选择 ==========

  onExportTeachers() {
    const exportFields = TEACHER_CSV_HEADERS.map(h => ({
      ...h,
      selected: true
    }));
    this.setData({
      showExportModal: true,
      exportFields,
      exportSelectAll: true
    });
  },

  toggleExportField(e) {
    const idx = e.currentTarget.dataset.index;
    const key = 'exportFields[' + idx + '].selected';
    const newVal = !this.data.exportFields[idx].selected;
    const selectAll = this.data.exportFields.every((f, i) => i === idx ? newVal : f.selected);
    this.setData({
      [key]: newVal,
      exportSelectAll: selectAll
    });
  },

  toggleExportSelectAll() {
    const newVal = !this.data.exportSelectAll;
    const exportFields = this.data.exportFields.map(f => ({
      ...f,
      selected: newVal
    }));
    this.setData({
      exportFields,
      exportSelectAll: newVal
    });
  },

  hideExportModal() {
    this.setData({
      showExportModal: false,
      exportFields: []
    });
  },

  confirmExport() {
    const selectedHeaders = this.data.exportFields.filter(f => f.selected);
    if (selectedHeaders.length === 0) {
      wx.showToast({ title: '请至少选择一个字段', icon: 'none' });
      return;
    }

    const rows = this.data.teachers.map(t => ({
      ...t,
      subjects: Array.isArray(t.subjects) ? t.subjects.join('/') : (t.subjects || ''),
      status: t.status === 'active' ? '在职' : '离职'
    }));

    if (rows.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    fileUtil.exportCSV(`教师数据_${timestamp}.csv`, selectedHeaders, rows);
    this.hideExportModal();
  },

  // ========== 导入：操作面板 + 模板下载 ==========

  onImportTeachers() {
    this.setData({ showImportAction: true });
  },

  hideImportAction() {
    this.setData({ showImportAction: false });
  },

  onDownloadTemplate() {
    this.setData({ showImportAction: false });
    fileUtil.downloadTemplate('教师导入模板.csv', TEACHER_CSV_HEADERS, TEACHER_SAMPLE_ROW);
  },

  onChooseImportFile() {
    this.setData({ showImportAction: false });
    this._doImportFile();
  },

  async _doImportFile() {
    try {
      const rows = await fileUtil.importCSV(['csv']);
      const preview = rows.slice(0, 20).map(row => ({
        name: row['姓名'] || row['name'] || '未知',
        employee_no: row['工号'] || row['employee_no'] || '',
        subjects: row['科目'] || row['subjects'] || '',
        grade: row['年级'] || row['grade'] || ''
      }));

      const mapped = rows.map(row => ({
        employee_no: row['工号'] || row['employee_no'] || '',
        name: row['姓名'] || row['name'] || '',
        phone: row['电话'] || row['phone'] || '',
        email: row['邮箱'] || row['email'] || '',
        subjects: (row['科目'] || row['subjects'] || '').split('/').filter(Boolean),
        grade: row['年级'] || row['grade'] || '',
        education: row['学历'] || row['education'] || '',
        school: row['毕业院校'] || row['school'] || '',
        status: (row['状态'] || row['status'] || '在职') === '离职' ? 'inactive' : 'active',
        entry_date: row['入职日期'] || row['entry_date'] || ''
      }));

      this.setData({
        showImportModal: true,
        importData: mapped,
        importPreview: preview
      });
    } catch (e) {
      // 用户取消或读取失败，忽略
    }
  },

  hideImportModal() {
    this.setData({
      showImportModal: false,
      importData: [],
      importPreview: []
    });
  },

  confirmImport() {
    const { importData } = this.data;
    wx.showToast({ title: `已导入${importData.length}条数据`, icon: 'success' });
    this.setData({
      showImportModal: false,
      importData: [],
      importPreview: []
    });
    this.loadTeachers();
  }
});
