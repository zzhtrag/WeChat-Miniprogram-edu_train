const api = require('../../utils/api.js');
const fileUtil = require('../../utils/fileUtil.js');

Page({
  data: {
    classOptions: [],
    selectedClassId: '',
    classIndex: 0,
    studentOptions: [],
    selectedStudentId: '',
    studentIndex: 0,
    title: '',
    category: 'homework',
    categoryOptions: [
      { key: 'artwork', label: '艺术作品' },
      { key: 'essay', label: '作文' },
      { key: 'exam_paper', label: '试卷' },
      { key: 'homework', label: '作业' },
      { key: 'competition', label: '竞赛作品' },
      { key: 'other', label: '其他' }
    ],
    categoryIndex: 3,
    description: '',
    teacherComment: '',
    tagsInput: '',
    workDate: '',
    isFeatured: false,
    isExcellent: false,
    imageList: [],
    submitting: false
  },

  async onLoad(options) {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const teachers = await api.get('/teachers');
      const teacher = teachers?.find(t => t.user_id === userInfo?.id);
      if (!teacher) return;

      const teacherId = teacher.id;
      const classes = await api.get('/teachers/' + teacherId + '/classes');
      const today = new Date().toISOString().split('T')[0];

      let selectedClassId = options.class_id || '';
      if (!selectedClassId && classes.length > 0) {
        selectedClassId = classes[0].id;
      }

      this.setData({
        teacherId,
        classOptions: classes,
        selectedClassId,
        classIndex: classes.findIndex(c => c.id === selectedClassId),
        workDate: today
      });

      if (selectedClassId) {
        this.loadStudents(selectedClassId);
      }
    } catch (err) {
    }
  },

  async loadStudents(classId) {
    try {
      const students = await api.get('/classes/' + classId + '/students');
      const studentOptions = students.map(s => ({
        id: s.id,
        name: s.name
      }));
      this.setData({
        studentOptions,
        selectedStudentId: studentOptions.length > 0 ? studentOptions[0].id : '',
        studentIndex: 0
      });
    } catch (err) {
    }
  },

  onClassChange(e) {
    const index = e.detail.value;
    const classId = this.data.classOptions[index]?.id;
    this.setData({ classIndex: index, selectedClassId: classId });
    if (classId) this.loadStudents(classId);
  },

  onStudentChange(e) {
    const index = e.detail.value;
    this.setData({
      studentIndex: index,
      selectedStudentId: this.data.studentOptions[index]?.id
    });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({ categoryIndex: index, category: this.data.categoryOptions[index].key });
  },

  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  onCommentInput(e) {
    this.setData({ teacherComment: e.detail.value });
  },

  onTagsInput(e) {
    this.setData({ tagsInput: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ workDate: e.detail.value });
  },

  toggleFeatured() {
    this.setData({ isFeatured: !this.data.isFeatured });
  },

  toggleExcellent() {
    this.setData({ isExcellent: !this.data.isExcellent });
  },

  chooseImage() {
    const remaining = 9 - this.data.imageList.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多9张图片', icon: 'none' });
      return;
    }

    fileUtil.chooseImageForPortfolio((err, tempFilePaths) => {
      if (err || !tempFilePaths) return;
      const newImages = this.data.imageList.concat(tempFilePaths.slice(0, remaining));
      this.setData({ imageList: newImages });
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const imageList = [...this.data.imageList];
    imageList.splice(index, 1);
    this.setData({ imageList });
  },

  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    wx.previewImage({
      current,
      urls: this.data.imageList
    });
  },

  async submit() {
    const { title, selectedStudentId, selectedClassId, category, description,
      teacherComment, tagsInput, workDate, isFeatured, isExcellent, imageList } = this.data;

    if (!title.trim()) {
      wx.showToast({ title: '请输入作品标题', icon: 'none' });
      return;
    }
    if (!selectedStudentId) {
      wx.showToast({ title: '请选择学生', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const tags = fileUtil.parseTagsInput(tagsInput);
    const fileUrl = imageList.length > 0 ? imageList[0] : '';
    const thumbnail = imageList.length > 0 ? imageList[0] : '';
    const ext = fileUrl ? (fileUrl.split('.').pop().toLowerCase() || 'jpg') : 'jpg';

    try {
      await api.post('/portfolios', {
        student_id: selectedStudentId,
        class_id: selectedClassId,
        teacher_id: this.data.teacherId,
        title: title.trim(),
        category,
        description,
        teacher_comment: teacherComment,
        tags,
        work_date: workDate,
        is_featured: isFeatured,
        is_excellent: isExcellent,
        file_type: ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' ? ext : 'jpg',
        file_url: fileUrl,
        thumbnail: thumbnail,
        file_name: title.trim() + '.' + ext,
        file_size: 0
      });

      wx.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => {
        this.setData({ submitting: false });
        wx.navigateBack();
      }, 800);
    } catch (err) {
      this.setData({ submitting: false });
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  }
});
