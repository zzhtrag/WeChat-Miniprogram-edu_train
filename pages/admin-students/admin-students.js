const api = require('../../utils/api.js');
const fileUtil = require('../../utils/fileUtil.js');

const STUDENT_CSV_HEADERS = [
  { key: 'student_no', label: '学号', required: true },
  { key: 'name', label: '姓名', required: true },
  { key: 'gender', label: '性别' },
  { key: 'birthday', label: '生日' },
  { key: 'grade', label: '年级' },
  { key: 'parent_name', label: '家长姓名' },
  { key: 'parent_phone', label: '家长电话' },
  { key: 'address', label: '地址' },
  { key: 'tags', label: '标签' },
  { key: 'remarks', label: '备注' },
  { key: 'status', label: '状态' },
  { key: 'enrolled_date', label: '入学日期' }
];

const STUDENT_SAMPLE_ROW = {
  student_no: 'S2024001',
  name: '张三',
  gender: '男',
  birthday: '2008-05-15',
  grade: '高一',
  parent_name: '张父',
  parent_phone: '13800138001',
  address: '青岛市南区',
  tags: '优秀/数学',
  remarks: '示例学生',
  status: '在读',
  enrolled_date: '2024-09-01'
};

Page({
  data: {
    keyword: '',
    students: [],
    studentStats: {
      total: 0,
      active: 0,
      inactive: 0
    },
    showFilterModal: false,
    filterStatus: '',
    filterGrade: '',
    showActionSheet: false,
    currentStudent: null,
    grades: ['高一', '高二', '高三', '初中部'],
    showImportModal: false,
    importData: [],
    importPreview: [],
    showImportAction: false,
    showExportModal: false,
    exportFields: [],
    exportSelectAll: true
  },

  onLoad() {
    this.loadStudents();
  },

  onShow() {
    this.loadStudents();
  },

  async loadStudents() {
    try {
      const students = await api.get('/students', {
        keyword: this.data.keyword,
        status: this.data.filterStatus,
        grade: this.data.filterGrade
      });

      const allStudents = await api.get('/students');
      const stats = {
        total: allStudents.length,
        active: allStudents.filter(s => s.status === 'active').length,
        inactive: allStudents.filter(s => s.status === 'inactive').length
      };

      // 转换数据字段名以匹配 WXML
      const studentList = students.map(s => ({
        id: s.id,
        name: s.name,
        studentNo: s.student_no,
        gender: s.gender,
        birthday: s.birthday,
        grade: s.grade,
        parentName: s.parent_name,
        parentPhone: s.parent_phone,
        address: s.address,
        tags: s.tags,
        remarks: s.remarks,
        status: s.status,
        enrolledDate: s.enrolled_date,
        classCount: s.class_count || 0,
        classNames: s.class_names || [],
        courseNames: s.course_names || []
      }));

      this.setData({
        students,
        studentList,
        studentStats: stats,
        stats: stats
      });
    } catch (err) {
      console.error('加载学生数据失败:', err);
    }
  },

  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  onSearch() {
    this.loadStudents();
  },

  clearSearch() {
    this.setData({
      keyword: ''
    });
    this.loadStudents();
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

  setFilterGrade(e) {
    this.setData({
      filterGrade: e.currentTarget.dataset.grade
    });
  },

  resetFilter() {
    this.setData({
      filterStatus: '',
      filterGrade: ''
    });
  },

  confirmFilter() {
    this.setData({
      showFilterModal: false
    });
    this.loadStudents();
  },

  viewStudent(e) {
    const studentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-student-detail/admin-student-detail?id=${studentId}`
    });
  },

  viewStudentDetail(e) {
    const studentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-student-detail/admin-student-detail?id=${studentId}`
    });
  },

  addStudent() {
    wx.navigateTo({
      url: '/pages/admin-student-edit/admin-student-edit'
    });
  },

  showActions(e) {
    const studentId = e.currentTarget.dataset.id;
    const student = this.data.students.find(s => s.id === studentId);
    this.setData({
      showActionSheet: true,
      currentStudent: student
    });
  },

  hideActionSheet() {
    this.setData({
      showActionSheet: false,
      currentStudent: null
    });
  },

  noop() {
    // 空方法，用于阻止事件冒泡
  },

  editStudent(e) {
    const studentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-student-edit/admin-student-edit?id=${studentId}`
    });
  },

  deleteStudent(e) {
    const studentId = e.currentTarget ? e.currentTarget.dataset.id : null;
    const student = studentId
      ? this.data.students.find(s => s.id === studentId)
      : this.data.currentStudent;

    if (!student) return;

    const that = this;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除学员"${student.name}"吗？删除后不可恢复。`,
      confirmColor: '#ff4d4f',
      success(res) {
        if (res.confirm) {
          api.delete('/students/' + student.id).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' });
            that.hideActionSheet();
            that.loadStudents();
          }).catch(err => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  async toggleStudentStatus() {
    const { currentStudent } = this.data;
    const newStatus = currentStudent.status === 'active' ? 'inactive' : 'active';

    try {
      await api.put('/students/' + currentStudent.id + '/status', { status: newStatus });
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.hideActionSheet();
      this.loadStudents();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onPullDownRefresh() {
    this.loadStudents();
    wx.stopPullDownRefresh();
  },

  // ========== 导出：字段选择 ==========

  onExportStudents() {
    const exportFields = STUDENT_CSV_HEADERS.map(h => ({
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

    const rows = this.data.students.map(s => ({
      ...s,
      tags: Array.isArray(s.tags) ? s.tags.join('/') : (s.tags || ''),
      status: s.status === 'active' ? '在读' : '离校'
    }));

    if (rows.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    fileUtil.exportCSV(`学生数据_${timestamp}.csv`, selectedHeaders, rows);
    this.hideExportModal();
  },

  // ========== 导入：操作面板 + 模板下载 ==========

  onImportStudents() {
    this.setData({ showImportAction: true });
  },

  hideImportAction() {
    this.setData({ showImportAction: false });
  },

  onDownloadTemplate() {
    this.setData({ showImportAction: false });
    fileUtil.downloadTemplate('学生导入模板.csv', STUDENT_CSV_HEADERS, STUDENT_SAMPLE_ROW);
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
        student_no: row['学号'] || row['student_no'] || '',
        grade: row['年级'] || row['grade'] || '',
        gender: row['性别'] || row['gender'] || ''
      }));

      const mapped = rows.map(row => ({
        student_no: row['学号'] || row['student_no'] || '',
        name: row['姓名'] || row['name'] || '',
        gender: row['性别'] || row['gender'] || '',
        birthday: row['生日'] || row['birthday'] || '',
        grade: row['年级'] || row['grade'] || '',
        parent_name: row['家长姓名'] || row['parent_name'] || '',
        parent_phone: row['家长电话'] || row['parent_phone'] || '',
        address: row['地址'] || row['address'] || '',
        tags: (row['标签'] || row['tags'] || '').split('/').filter(Boolean),
        remarks: row['备注'] || row['remarks'] || '',
        status: (row['状态'] || row['status'] || '在读') === '离校' ? 'inactive' : 'active',
        enrolled_date: row['入学日期'] || row['enrolled_date'] || ''
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
    this.loadStudents();
  }
});
