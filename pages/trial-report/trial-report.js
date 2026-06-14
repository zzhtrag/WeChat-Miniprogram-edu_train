const api = require('../../utils/api.js');

Page({
  data: {
    report: null,
    loading: true,
    countdown: '',
    interestLabels: ['一般', '有些兴趣', '比较感兴趣', '很感兴趣', '非常感兴趣']
  },

  onLoad(options) {
    if (options.id) {
      this.loadReport(options.id);
    }
  },

  async loadReport(id) {
    this.setData({ loading: true });
    try {
      const report = await api.get('/trial-reports/' + id);
      if (report) {
        report.performance_details = this.buildPerformanceDetails(report);
        report.ability_analysis = this.buildAbilityAnalysis(report);
        this.setData({ report });

        if (report.discount_info && report.discount_info.valid_until && report.status === 'sent') {
          this.startCountdown(report.discount_info.valid_until);
        }
      }
    } catch (err) {}
    this.setData({ loading: false });
  },

  buildPerformanceDetails(report) {
    const details = [];
    if (report.participation !== undefined) {
      details.push({ label: '参与度', value: report.participation, percent: report.participation });
    }
    if (report.focus !== undefined) {
      details.push({ label: '专注力', value: report.focus, percent: report.focus });
    }
    if (report.response !== undefined) {
      details.push({ label: '互动性', value: report.response, percent: report.response });
    }
    if (report.creativity !== undefined) {
      details.push({ label: '创造力', value: report.creativity, percent: report.creativity });
    }
    return details;
  },

  buildAbilityAnalysis(report) {
    if (!report.ability_scores) return report.ability_analysis || [];
    return report.ability_scores.map(s => {
      let level = '待提升';
      if (s.score >= 85) level = '优秀';
      else if (s.score >= 70) level = '良好';
      else if (s.score >= 50) level = '一般';
      return {
        dimension: s.dimension,
        level,
        percent: s.score,
        comment: s.comment || ''
      };
    });
  },

  startCountdown(validUntil) {
    const endTime = new Date(validUntil).getTime();
    this._countdownTimer = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        clearInterval(this._countdownTimer);
        this.setData({ countdown: '已过期' });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      this.setData({
        countdown: `剩余 ${hours}时${mins}分${secs}秒`
      });
    }, 1000);
  },

  async confirmEnrollment() {
    const report = this.data.report;
    wx.showModal({
      title: '确认报名',
      content: `确认报名「${report.recommended_course ? report.recommended_course.name : report.class_name}」？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.post('/trial-reports/' + report.id + '/confirm');
            wx.showToast({ title: '报名确认成功', icon: 'success' });
            this.setData({ 'report.status': 'confirmed' });
          } catch (err) {
            wx.showToast({ title: '确认失败，请稍后重试', icon: 'none' });
          }
        }
      }
    });
  },

  shareReport() {
    wx.showToast({ title: '请点击右上角分享', icon: 'none' });
  },

  contactSchool() {
    wx.makePhoneCall({ phoneNumber: '400-000-0000' });
  },

  onUnload() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer);
    }
  },

  onShareAppMessage() {
    const report = this.data.report;
    if (!report) return {};
    return {
      title: `${report.student_name}的试听体验报告`,
      path: '/pages/trial-report/trial-report?id=' + report.id
    };
  }
});