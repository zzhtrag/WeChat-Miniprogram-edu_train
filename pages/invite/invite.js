const api = require('../../utils/api.js');
const sharePoints = require('../../utils/share-points.js');

Page({
  data: {
    schoolInfo: {},
    referralCode: '',
    stats: {
      total: 0,
      trial: 0,
      enrolled: 0,
      rewards: 0
    },
    records: [],
    showRules: false,
    pointsBalance: 0,
    shareId: ''
  },

  onLoad() {
    this.loadData();
  },

  async loadData() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    // 加载学校信息
    try {
      const schoolInfo = await api.get('/school-profile');
      this.setData({ schoolInfo: schoolInfo || {} });
    } catch (err) {
      console.error('加载学校信息失败', err);
    }

    try {
      const parents = await api.get('/parents', { user_id: userInfo?.id });
      const parent = parents && parents.length > 0 ? parents[0] : null;
      if (!parent) return;

      const stats = await api.get('/referrals/stats', { parent_id: parent.id });
      const records = await api.get('/referrals/mine', { parent_id: parent.id });
      const pointsInfo = await api.get('/gift-points', { parent_id: parent.id });

      // Prepare shareId
      const shareId = await sharePoints.createShareRecord(parent.id, 'invite', '/pages/school-home/school-home');

      this.setData({
        referralCode: parent.referral_code || this.generateCode(userInfo.id),
        stats: stats || { total: 0, trial: 0, enrolled: 0, rewards: 0 },
        records: records || [],
        pointsBalance: pointsInfo ? pointsInfo.balance : 0,
        shareId: shareId || ''
      });
    } catch (err) {
      this.setData({
        referralCode: this.generateCode(Date.now())
      });
    }
  },

  generateCode(seed) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.abs(seed * (i + 7) + i * 31) % chars.length];
    }
    return code;
  },

  copyCode() {
    wx.setClipboardData({
      data: this.data.referralCode,
      success() {
        wx.showToast({ title: '已复制推荐码', icon: 'success' });
      }
    });
  },

  generatePoster() {
    wx.showToast({ title: '海报生成中...', icon: 'loading', duration: 1500 });
    setTimeout(() => {
      wx.showToast({ title: '海报已保存到相册', icon: 'success' });
    }, 1500);
  },

  shareToSchoolHome() {
    wx.navigateTo({
      url: '/pages/school-home/school-home'
    });
  },

  async claimReward(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await api.post('/referrals/' + id + '/claim');
      wx.showToast({ title: '奖励领取成功', icon: 'success' });
      this.loadData();
    } catch (err) {
      wx.showToast({ title: '领取失败', icon: 'none' });
    }
  },

  toggleRules() {
    this.setData({ showRules: !this.data.showRules });
  },

  onShareAppMessage() {
    let path = '/pages/school-home/school-home?ref=' + this.data.referralCode;
    if (this.data.shareId) {
      path += '&shareId=' + this.data.shareId;
    }
    return {
      title: '我在这里上课，推荐你带孩子来试听',
      path: path
    };
  },

  goToMenu(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});