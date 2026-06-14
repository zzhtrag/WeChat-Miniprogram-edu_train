const api = require('../../utils/api.js');
const fileUtil = require('../../utils/fileUtil.js');

Page({
  data: {
    categoryTabs: [
      { key: '', label: '全部' },
      { key: 'courseware', label: '课件' },
      { key: 'lesson_plan', label: '教案' },
      { key: 'exercise', label: '习题' },
      { key: 'reference', label: '参考资料' },
      { key: 'other', label: '其他' }
    ],
    activeTab: 0,
    activeCategory: '',
    keyword: '',
    materials: [],
    folders: [],
    currentFolderId: null,
    currentFolderName: '',
    stats: {},
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 800);
  },

  async loadData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const teachers = await api.get('/teachers');
    const teacher = teachers?.find(t => t.user_id === userInfo?.id);
    if (!teacher) {
      this.setData({ loading: false });
      return;
    }

    const teacherId = teacher.id;
    const stats = await api.get('/teachers/' + teacherId + '/material-stats');
    const folders = await api.get('/folders', teacherId);
    const materials = await api.get('/materials', {
      teacher_id: teacherId,
      category: this.data.activeCategory || undefined,
      folder_id: this.data.currentFolderId || undefined,
      keyword: this.data.keyword || undefined,
      status: 'active'
    });

    this.setData({
      teacherId,
      stats,
      folders,
      materials,
      loading: false
    });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    const category = this.data.categoryTabs[index].key;
    this.setData({ activeTab: index, activeCategory: category }, () => this.loadData());
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadData();
  },

  enterFolder(e) {
    const folderId = e.currentTarget.dataset.id;
    const folderName = e.currentTarget.dataset.name;
    this.setData({ currentFolderId: folderId, currentFolderName: folderName }, () => this.loadData());
  },

  exitFolder() {
    this.setData({ currentFolderId: null, currentFolderName: '' }, () => this.loadData());
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/teacher-material-detail/teacher-material-detail?id=' + id });
  },

  goToUpload() {
    wx.navigateTo({ url: '/pages/teacher-material-upload/teacher-material-upload' });
  },

  showFolderAction(e) {
    const folderId = e.currentTarget.dataset.id;
    const folderName = e.currentTarget.dataset.name;
    wx.showActionSheet({
      itemList: ['重命名', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.renameFolder(folderId, folderName);
        } else if (res.tapIndex === 1) {
          this.deleteFolder(folderId);
        }
      }
    });
  },

  renameFolder(folderId, currentName) {
    wx.showModal({
      title: '重命名文件夹',
      editable: true,
      placeholderText: currentName,
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await api.put('/folders/' + folderId, { name: res.content });
            this.loadData();
            wx.showToast({ title: '已重命名', icon: 'success' });
          } catch (err) {
            wx.showToast({ title: '重命名失败', icon: 'none' });
          }
        }
      }
    });
  },

  deleteFolder(folderId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个文件夹吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.delete('/folders/' + folderId);
            if (result.success) {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.loadData();
            } else {
              wx.showToast({ title: result.error, icon: 'none' });
            }
          } catch (err) {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  createFolder() {
    wx.showModal({
      title: '新建文件夹',
      editable: true,
      placeholderText: '请输入文件夹名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await api.post('/folders', {
              teacher_id: this.data.teacherId,
              name: res.content,
              subject: ''
            });
            this.loadData();
            wx.showToast({ title: '创建成功', icon: 'success' });
          } catch (err) {
            wx.showToast({ title: '创建失败', icon: 'none' });
          }
        }
      }
    });
  }
});
