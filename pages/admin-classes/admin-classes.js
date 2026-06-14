const api = require('../../utils/api.js');

Page({
  data: {
    keyword: '',
    classes: [],
    classStats: {
      total: 0,
      active: 0,
      inactive: 0
    },
    showFilterModal: false,
    filterStatus: '',
    showActionSheet: false,
    currentClass: null
  },

  onLoad() {
    this.loadClasses();
  },

  onShow() {
    this.loadClasses();
  },

  async loadClasses() {
    const classes = await api.get('/classes', {
      keyword: this.data.keyword,
      status: this.data.filterStatus
    });
    const allClasses = await api.get('/classes');
    const stats = {
      total: allClasses.length,
      active: allClasses.filter(c => c.status === 'active').length,
      inactive: allClasses.filter(c => c.status === 'inactive').length
    };

    this.setData({ classes, classStats: stats });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 搜索确认
  onSearch() {
    this.loadClasses();
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      keyword: ''
    });
    this.loadClasses();
  },

  // 显示筛选弹窗
  showFilter() {
    this.setData({
      showFilterModal: true
    });
  },

  // 隐藏筛选弹窗
  hideFilter() {
    this.setData({
      showFilterModal: false
    });
  },

  // 设置状态筛选
  setFilterStatus(e) {
    this.setData({
      filterStatus: e.currentTarget.dataset.status
    });
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      filterStatus: ''
    });
  },

  // 确认筛选
  confirmFilter() {
    this.setData({
      showFilterModal: false
    });
    this.loadClasses();
  },

  // 查看班级详情
  viewClassDetail(e) {
    const classId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-class-detail/admin-class-detail?id=${classId}`
    });
  },

  // 添加班级
  addClass() {
    wx.navigateTo({
      url: '/pages/admin-class-edit/admin-class-edit'
    });
  },

  // 显示操作菜单
  showActions(e) {
    const classId = e.currentTarget.dataset.id;
    const classItem = this.data.classes.find(c => c.id === classId);
    this.setData({
      showActionSheet: true,
      currentClass: classItem
    });
  },

  // 隐藏操作菜单
  hideActionSheet() {
    this.setData({
      showActionSheet: false,
      currentClass: null
    });
  },

  // 编辑班级
  editClass() {
    const { currentClass } = this.data;
    this.hideActionSheet();
    wx.navigateTo({
      url: `/pages/admin-class-edit/admin-class-edit?id=${currentClass.id}`
    });
  },

  async toggleClassStatus() {
    const { currentClass } = this.data;
    const newStatus = currentClass.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put('/classes/' + currentClass.id + '/status', { status: newStatus });
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      this.hideActionSheet();
      this.loadClasses();
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteClass() {
    const { currentClass } = this.data;
    const that = this;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除班级"${currentClass.name}"吗？删除后不可恢复。`,
      confirmColor: '#ff4d4f',
      async success(res) {
        if (res.confirm) {
          try {
            await api.delete('/classes/' + currentClass.id);
            wx.showToast({ title: '删除成功', icon: 'success' });
            that.hideActionSheet();
            that.loadClasses();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadClasses();
    wx.stopPullDownRefresh();
  }
});
