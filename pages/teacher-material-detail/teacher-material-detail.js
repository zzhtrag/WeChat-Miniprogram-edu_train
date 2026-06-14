const api = require('../../utils/api.js');
const fileUtil = require('../../utils/fileUtil.js');

Page({
  data: {
    material: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.materialId = options.id;
      this.loadData();
    }
  },

  async loadData() {
    const material = await api.get('/materials/' + this.materialId);
    if (material) {
      material.file_size_str = fileUtil.formatFileSize(material.file_size);
      material.file_type_icon = fileUtil.getFileTypeIcon(material.file_type);
      material.file_type_color = fileUtil.getFileTypeColor(material.file_type);
    }
    this.setData({ material, loading: false });
  },

  previewFile() {
    const { material } = this.data;
    if (!material) return;

    if (['jpg', 'jpeg', 'png', 'gif'].includes(material.file_type)) {
      wx.previewImage({
        urls: [material.file_url],
        current: material.file_url
      });
    } else if (material.file_url && material.file_url.startsWith('http')) {
      wx.showModal({
        title: '预览文件',
        content: '文档预览功能需要真机环境支持',
        showCancel: false
      });
    } else {
      wx.showToast({ title: '该文件暂不支持预览', icon: 'none' });
    }
  },

  editMaterial() {
    wx.navigateTo({
      url: '/pages/teacher-material-upload/teacher-material-upload?id=' + this.materialId
    });
  },

  async shareToClass() {
    const { material } = this.data;
    if (!material) return;

    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const teachers = await api.get('/teachers');
    const teacher = teachers?.find(t => t.user_id === userInfo?.id);
    if (!teacher) return;

    const classes = await api.get('/teachers/' + teacher.id + '/classes');
    const sharedIds = material.shared_class_ids || [];

    const classItems = classes.map(c => ({
      id: c.id,
      name: c.name,
      checked: sharedIds.includes(c.id)
    }));

    this.setData({ showShareModal: true, classItems });
  },

  closeShareModal() {
    this.setData({ showShareModal: false });
  },

  toggleClassShare(e) {
    const classId = e.currentTarget.dataset.id;
    const classItems = this.data.classItems.map(c => {
      if (c.id === classId) c.checked = !c.checked;
      return c;
    });
    this.setData({ classItems });
  },

  async confirmShare() {
    const { classItems, material } = this.data;
    const selectedIds = classItems.filter(c => c.checked).map(c => c.id);
    const currentIds = material.shared_class_ids || [];

    try {
      // Add new shares
      for (const id of selectedIds) {
        if (!currentIds.includes(id)) {
          await api.post('/materials/' + this.materialId + '/share/' + id);
        }
      }
      // Remove old shares
      for (const id of currentIds) {
        if (!selectedIds.includes(id)) {
          await api.delete('/materials/' + this.materialId + '/share/' + id);
        }
      }

      this.setData({ showShareModal: false });
      this.loadData();
      wx.showToast({ title: '分享设置已更新', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  deleteMaterial() {
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这份资料吗？',
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await api.delete('/materials/' + this.materialId);
            if (result.success) {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 800);
            } else {
              wx.showToast({ title: result.error, icon: 'none' });
            }
          } catch (err) {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
