const api = require('../../utils/api.js');
const fileUtil = require('../../utils/fileUtil.js');

Page({
  data: {
    materials: [],
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

    try {
      // 获取当前学生关联的班级
      const parents = await api.get('/parents', { user_id: userInfo?.id });
      const parent = parents?.find(p => p.user_id === userInfo?.id);
      if (!parent) {
        this.setData({ loading: false });
        return;
      }

      // 查找家长关联的学生
      const students = await api.get('/students', { parent_id: parent.id });
      const classIds = [];
      for (const student of students) {
        const enrollments = await api.get('/students/' + student.id + '/enrollments');
        enrollments.forEach(e => {
          if (!classIds.includes(e.class_id)) classIds.push(e.class_id);
        });
      }

      // 获取分享到这些班级的资料
      let allMaterials = [];
      for (const classId of classIds) {
        const materials = await api.get('/classes/' + classId + '/materials');
        allMaterials = allMaterials.concat(materials);
      }

      // 去重
      const seen = new Set();
      allMaterials = allMaterials.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        m.file_size_str = fileUtil.formatFileSize(m.file_size);
        return true;
      });

      this.setData({ materials: allMaterials, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  previewMaterial(e) {
    const material = e.currentTarget.dataset.item;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(material.file_type) && material.file_url) {
      wx.previewImage({
        urls: [material.file_url],
        current: material.file_url
      });
    } else {
      wx.showToast({ title: '文档预览需真机环境', icon: 'none' });
    }
  }
});
