// pages/admin-enrollments/admin-enrollments.js
const api = require('../../utils/api.js');

Page({
  data: {
    list: [],
    filteredList: [],
    stats: {},
    keyword: '',
    statusFilter: '',
    statusTabs: [
      { value: '', label: '全部' },
      { value: 'enrolled', label: '已报名' },
      { value: 'paid', label: '已缴费' },
      { value: 'admitted', label: '已入学' }
    ],
    activeTab: '',
    classes: [],
    showActionSheet: false,
    showClassPicker: false,
    currentReg: null,
    actionType: ''
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 800);
  },

  async loadData() {
    const list = await api.get('/registrations');
    const stats = await api.get('/registrations/stats');
    const classes = await api.get('/classes', { status: 'active' });

    this.setData({
      list,
      stats,
      classes,
      filteredList: this.applyFilter(list, this.data.keyword, this.data.activeTab)
    });
  },

  applyFilter(list, keyword, status) {
    let result = list;
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(r =>
        r.student_name.includes(kw) ||
        r.parent_name.includes(kw) ||
        r.parent_phone.includes(kw) ||
        r.code.includes(kw)
      );
    }
    if (status) {
      result = result.filter(r => r.status === status);
    }
    return result;
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    this.setData({
      filteredList: this.applyFilter(this.data.list, this.data.keyword, this.data.activeTab)
    });
  },

  onSearch() {
    this.setData({
      filteredList: this.applyFilter(this.data.list, this.data.keyword, this.data.activeTab)
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.value;
    this.setData({ activeTab: tab });
    this.setData({
      filteredList: this.applyFilter(this.data.list, this.data.keyword, tab)
    });
  },

  showActions(e) {
    const regId = e.currentTarget.dataset.id;
    const reg = this.data.list.find(r => r.id === regId);
    if (!reg) return;

    this.setData({ currentReg: reg, showActionSheet: true });
  },

  closeActionSheet() {
    this.setData({ showActionSheet: false, currentReg: null });
  },

  markPaid() {
    const reg = this.data.currentReg;
    if (!reg || reg.status !== 'enrolled') return;

    wx.showModal({
      title: '确认操作',
      content: `确认将 ${reg.student_name} 标记为已缴费？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put('/registrations/' + reg.id + '/status', { status: 'paid' });
            this.closeActionSheet();
            this.loadData();
            wx.showToast({ title: '已标记为已缴费', icon: 'success' });
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  markAdmitted() {
    const reg = this.data.currentReg;
    if (!reg || reg.status !== 'paid') return;

    this.setData({ showActionSheet: false, showClassPicker: true });
  },

  closeClassPicker() {
    this.setData({ showClassPicker: false, currentReg: null });
  },

  selectClass(e) {
    const classId = e.currentTarget.dataset.id;
    const reg = this.data.currentReg;
    if (!reg) return;

    const classItem = this.data.classes.find(c => c.id === classId);
    const className = classItem ? classItem.name : '';

    wx.showModal({
      title: '确认入学',
      content: `将 ${reg.student_name} 分配至 ${className} 并标记为已入学？系统将自动为其创建登录账号（手机号登录，密码为手机后6位）。`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.put('/registrations/' + reg.id + '/status', { status: 'admitted', class_id: classId });
            this.setData({ showClassPicker: false, currentReg: null });
            this.loadData();

            if (result && result.class_id) {
            wx.showModal({
              title: '入学成功',
              content: `${reg.student_name} 已成功入学！\n\n登录账号：${reg.parent_phone}\n初始密码：${reg.parent_phone.slice(-6)}\n\n请将账号信息通知家长。`,
              showCancel: false
            });
          } else {
            wx.showToast({ title: '已标记为已入学', icon: 'success' });
          }
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  oneClickRegister(e) {
    const regId = e.currentTarget.dataset.id;
    const reg = this.data.list.find(r => r.id === regId);
    if (!reg) return;

    wx.showModal({
      title: '一键注册',
      content: `将为 ${reg.parent_name}（${reg.parent_phone}）创建登录账号，密码为手机后6位。确认？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const existingUser = await api.get('/users/phone/' + reg.parent_phone);
            if (existingUser) {
              wx.showToast({ title: '该手机号已有账号', icon: 'none' });
              return;
            }

            const result = await api.post('/registrations/' + reg.id + '/auto-register');
            if (result) {
              this.loadData();
              wx.showModal({
                title: '注册成功',
                content: `账号：${reg.parent_phone}\n密码：${reg.parent_phone.slice(-6)}`,
                showCancel: false
              });
            }
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  }
});
