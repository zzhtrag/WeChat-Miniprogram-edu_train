const api = require('../../utils/api.js');
const sharePoints = require('../../utils/share-points.js');

Page({
  data: {
    period: 'weekly',
    report: null,
    schoolInfo: {},
    loading: true,
    showPreview: false,
    shareId: ''
  },

  onLoad(options) {
    if (options.period) {
      this.setData({ period: options.period });
    }
    if (options.shareId) {
      sharePoints.trackShareVisit(options);
    }
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 800);
  },

  async loadData() {
    this.setData({ loading: true });
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const currentStudent = app.globalData.currentStudent;
      if (!currentStudent) {
        const parents = await api.get('/parents', { user_id: userInfo?.id });
        const parent = parents && parents.length > 0 ? parents[0] : null;
        if (parent) {
          const students = await api.get('/students', { parent_id: parent.id });
          if (students.length > 0) {
            app.setCurrentStudent(students[0]);
          }
        }
      }

      const student = app.globalData.currentStudent;
      if (!student) {
        this.setData({ loading: false });
        return;
      }

      const report = await api.get('/growth-reports/latest', {
        student_id: student.id,
        period: this.data.period
      });

      let schoolInfo = {};
      try {
        schoolInfo = await api.get('/school-profile');
      } catch (e) {}

      if (report) {
        report.score_trend_data = this.buildTrendData(report.score_history || []);
      }

      this.setData({
        report,
        schoolInfo,
        loading: false,
        showPreview: !!report
      });

      if (report) {
        this.prepareShareId();
      }
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  buildTrendData(scoreHistory) {
    if (!scoreHistory || scoreHistory.length === 0) return [];
    const max = Math.max(...scoreHistory.map(s => s.score), 1);
    return scoreHistory.map((s, i) => ({
      label: s.label,
      score: s.score,
      percent: Math.max((s.score / max) * 100, 5),
      is_highlight: i === scoreHistory.length - 1
    }));
  },

  switchPeriod(e) {
    const period = e.currentTarget.dataset.period;
    if (period === this.data.period) return;
    this.setData({ period }, () => this.loadData());
  },

  goToPortfolio(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/parent-portfolio-detail/parent-portfolio-detail?id=' + id
    });
  },

  onLogoTap() {
    wx.navigateTo({ url: '/pages/school-home/school-home' });
  },

  saveShareCard() {
    wx.showToast({
      title: '卡片已保存',
      icon: 'success'
    });
  },

  onShareAppMessage() {
    const report = this.data.report;
    let path = '/pages/growth-report/growth-report?period=' + this.data.period;
    if (this.data.shareId) {
      path += '&shareId=' + this.data.shareId;
    }
    return {
      title: `${report.student_name}的${this.data.period === 'weekly' ? '本周' : '本月'}成长报告`,
      path: path,
      imageUrl: ''
    };
  },

  async prepareShareId() {
    const app = getApp();
    if (app.globalData.userInfo && app.globalData.userInfo.role === 'parent') {
      const parentId = await sharePoints.getParentId();
      if (parentId) {
        const basePath = '/pages/growth-report/growth-report?period=' + this.data.period;
        const shareId = await sharePoints.createShareRecord(parentId, 'growth_report', basePath);
        if (shareId) {
          this.setData({ shareId });
        }
      }
    }
  }
});