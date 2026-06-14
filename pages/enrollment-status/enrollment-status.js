const api = require('../../utils/api.js');

Page({
  data: {
    phone: '',
    loading: false,
    searched: false,
    list: []
  },

  onLoad() {},

  onLogoTap() {
    wx.navigateTo({ url: '/pages/school-home/school-home' });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  async search() {
    const { phone } = this.data;
    if (!phone || phone.length < 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await api.get('/registrations/phone/' + phone);
      const list = Array.isArray(result) ? result : (result ? [result] : []);
      const now = new Date().toISOString().split('T')[0];
      list.forEach(r => {
        r.is_expired = r.expire_time < now;
      });
      this.setData({
        loading: false,
        searched: true,
        list
      });
    } catch (err) {
      this.setData({ loading: false, searched: true, list: [] });
      wx.showToast({ title: '查询失败，请重试', icon: 'none' });
    }
  },

  goToEnrollment() {
    wx.navigateTo({ url: '/pages/enrollment/enrollment' });
  }
});
