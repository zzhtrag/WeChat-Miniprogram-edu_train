const api = require('../../utils/api.js');

Page({
  data: {
    formData: {
      name: '',
      avatar: ''
    },
    submitting: false
  },

  onLoad() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        formData: {
          name: userInfo.name || '',
          avatar: userInfo.avatar || ''
        }
      });
    }
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ 'formData.avatar': tempFilePath });
      }
    });
  },

  async submit() {
    const { name, avatar } = this.data.formData;
    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      const app = getApp();
      const userId = app.globalData.userInfo.id;
      const updateData = { name: name.trim() };
      if (avatar && avatar !== app.globalData.userInfo.avatar) {
        updateData.avatar = avatar;
      }

      await api.put('/users/' + userId, updateData);

      const newUserInfo = { ...app.globalData.userInfo, ...updateData };
      app.setUserInfo(newUserInfo);

      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
