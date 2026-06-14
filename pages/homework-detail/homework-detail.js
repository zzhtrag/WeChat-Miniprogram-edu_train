const api = require('../../utils/api.js');
const format = require('../../utils/format.js');

Page({
  data: {
    homeworkId: '',
    loading: true,
    assignment: null,
    course: null,
    classInfo: null,
    teacher: null,
    submission: null,
    statusText: '',
    statusType: '',
    deadlineText: ''
  },

  onLoad(options) {
    this.setData({
      homeworkId: options.id || ''
    });
    this.loadData();
  },

  onShow() {
    if (this.data.homeworkId) {
      this.loadData();
    }
  },

  async loadData() {
    this.setData({ loading: true });

    const app = getApp();
    const currentStudent = app.globalData.currentStudent;
    const homeworkId = this.data.homeworkId;

    if (!homeworkId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      this.setData({ loading: false });
      return;
    }

    try {
      const assignment = await api.get('/assignments/' + homeworkId);
      if (!assignment) {
        wx.showToast({ title: '作业不存在', icon: 'none' });
        this.setData({ loading: false });
        return;
      }

      const [course, classInfo, teacher, submissions] = await Promise.all([
        api.get('/courses/' + assignment.course_id),
        api.get('/classes/' + assignment.class_id),
        api.get('/teachers/' + assignment.teacher_id),
        currentStudent ? api.get('/submissions', { assignment_id: homeworkId, student_id: currentStudent.id }) : Promise.resolve([])
      ]);

      // Find the student's submission
      let submission = null;
      if (currentStudent && submissions) {
        submission = (Array.isArray(submissions) ? submissions : []).find(
          s => s.assignment_id === homeworkId && s.student_id === currentStudent.id
        ) || null;
      }

      // Determine status
      let statusText = '';
      let statusType = '';
      if (submission) {
        if (submission.status === 'graded') {
          statusText = '已批改';
          statusType = 'success';
        } else {
          statusText = '已提交';
          statusType = 'warning';
        }
      } else {
        const now = new Date().getTime();
        const deadline = new Date(assignment.deadline).getTime();
        if (now > deadline) {
          statusText = '已过期';
          statusType = 'danger';
        } else {
          statusText = '待完成';
          statusType = 'danger';
        }
      }

      this.setData({
        assignment,
        course,
        classInfo,
        teacher,
        submission,
        statusText,
        statusType,
        deadlineText: format.formatDateTime(assignment.deadline),
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onSubmit() {
    wx.navigateTo({
      url: `/pages/homework-submit/homework-submit?id=${this.data.homeworkId}`
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onPreviewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls || [url];
    wx.previewImage({
      current: url,
      urls: urls
    });
  }
});
