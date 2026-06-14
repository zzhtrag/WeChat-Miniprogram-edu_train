const api = require('../../utils/api.js');
const format = require('../../utils/format.js');

Page({
  data: {
    homeworkId: '',
    loading: true,
    assignment: null,
    course: null,
    teacher: null,
    deadlineText: '',
    content: '',
    imageList: [],
    maxImages: 9,
    submitting: false
  },

  onLoad(options) {
    this.setData({
      homeworkId: options.id || ''
    });
    this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });

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

      const [course, teacher] = await Promise.all([
        api.get('/courses/' + assignment.course_id),
        api.get('/teachers/' + assignment.teacher_id)
      ]);

      this.setData({
        assignment,
        course,
        teacher,
        deadlineText: format.formatDateTime(assignment.deadline),
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  chooseImage() {
    const remaining = this.data.maxImages - this.data.imageList.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFilePaths;
        this.setData({
          imageList: this.data.imageList.concat(newImages)
        });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const imageList = this.data.imageList;
    imageList.splice(index, 1);
    this.setData({ imageList });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.imageList
    });
  },

  async submit() {
    if (this.data.submitting) return;

    const { content, imageList, homeworkId } = this.data;

    if (!content.trim()) {
      wx.showToast({ title: '请输入作业内容', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const app = getApp();
    const currentStudent = app.globalData.currentStudent;

    if (!currentStudent) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      this.setData({ submitting: false });
      return;
    }

    try {
      // Check if already submitted
      const submissions = await api.get('/submissions', { assignment_id: homeworkId, student_id: currentStudent.id });
      const existingSubmission = (Array.isArray(submissions) ? submissions : []).find(
        s => s.assignment_id === homeworkId && s.student_id === currentStudent.id
      );

      if (existingSubmission) {
        wx.showToast({ title: '已提交过作业', icon: 'none' });
        this.setData({ submitting: false });
        return;
      }

      // Submit homework
      await api.post('/submissions', {
        assignment_id: homeworkId,
        student_id: currentStudent.id,
        content: content.trim(),
        attachments: imageList
      });

      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      this.setData({ submitting: false });
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },

  onBack() {
    wx.navigateBack();
  }
});
