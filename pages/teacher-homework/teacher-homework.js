const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    activeTab: 0,
    tabs: ['待批改', '已发布', '批改中'],
    pendingHomework: [],
    studentSubmissions: [],
    showGradeModal: false,
    currentSubmission: null,
    gradeScore: '',
    gradeComment: ''
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  async loadData() {
    try {
      const [pendingHomework, studentSubmissions] = await Promise.all([
        api.get('/assignments', { status: 'pending' }),
        api.get('/submissions')
      ]);
      this.setData({
        pendingHomework: pendingHomework || [],
        studentSubmissions: studentSubmissions || []
      });
    } catch (err) {
    }
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index
    });
  },

  publishHomework() {
    wx.showToast({
      title: '发布作业功能',
      icon: 'none'
    });
  },

  viewHomeworkDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '查看作业详情',
      icon: 'none'
    });
  },

  openGradeModal(e) {
    const submission = e.currentTarget.dataset.submission;
    this.setData({
      showGradeModal: true,
      currentSubmission: submission,
      gradeScore: '',
      gradeComment: ''
    });
  },

  closeGradeModal() {
    this.setData({
      showGradeModal: false,
      currentSubmission: null
    });
  },

  onScoreInput(e) {
    this.setData({
      gradeScore: e.detail.value
    });
  },

  onCommentInput(e) {
    this.setData({
      gradeComment: e.detail.value
    });
  },

  async submitGrade() {
    const { gradeScore, gradeComment, currentSubmission } = this.data;
    if (!gradeScore) {
      wx.showToast({
        title: '请输入分数',
        icon: 'none'
      });
      return;
    }

    try {
      await api.put('/submissions/' + currentSubmission.id + '/grade', {
        score: Number(gradeScore),
        feedback: gradeComment
      });
      wx.showToast({
        title: '批改成功',
        icon: 'success'
      });
      this.closeGradeModal();
      this.loadData();
    } catch (err) {
      wx.showToast({ title: '批改失败', icon: 'none' });
    }
  }
});
