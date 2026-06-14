const api = require('../../utils/api.js');

Page({
  data: {
    assignment: null,
    student: null,
    submission: null,
    score: '',
    comment: '',
    loading: true
  },

  onLoad(options) {
    if (options.id && options.studentId) {
      this.assignmentId = options.id;
      this.studentId = options.studentId;
      this.loadData();
    }
  },

  async loadData() {
    try {
      const [assignment, student, allSubmissions] = await Promise.all([
        api.get('/assignments/' + this.assignmentId),
        api.get('/students/' + this.studentId),
        api.get('/submissions')
      ]);

      if (!assignment || !student) {
        this.setData({ loading: false });
        return;
      }

      // Find existing submission for this student
      const submission = (allSubmissions || []).find(
        s => s.assignment_id === this.assignmentId && s.student_id === this.studentId
      );

      this.setData({
        assignment: assignment,
        student: student,
        submission: submission,
        score: submission && submission.score !== null ? String(submission.score) : '',
        comment: submission ? submission.feedback || '' : '',
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onScoreInput(e) {
    this.setData({
      score: e.detail.value
    });
  },

  onCommentInput(e) {
    this.setData({
      comment: e.detail.value
    });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const images = this.data.submission ? (this.data.submission.attachments || []) : [];
    wx.previewImage({
      current: url,
      urls: images
    });
  },

  async submitGrade() {
    const { score, comment, submission } = this.data;

    if (!score && score !== '0') {
      wx.showToast({
        title: '请输入分数',
        icon: 'none'
      });
      return;
    }

    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      wx.showToast({
        title: '分数需在0-100之间',
        icon: 'none'
      });
      return;
    }

    if (!submission) {
      wx.showToast({
        title: '该学生尚未提交作业',
        icon: 'none'
      });
      return;
    }

    try {
      await api.put('/submissions/' + submission.id + '/grade', {
        score: scoreNum,
        feedback: comment
      });

      wx.showToast({
        title: '批改成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    } catch (err) {
      wx.showToast({ title: '批改失败', icon: 'none' });
    }
  },

  onBack() {
    wx.navigateBack();
  }
});
