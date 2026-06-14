const api = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    activeTab: 0,
    tabs: ['成绩列表', '成绩统计'],
    teacherClasses: [],
    selectedClassId: null,
    classStudents: [],
    topStudents: [],
    currentClassAvgScore: 0,
    showInputModal: false,
    currentStudent: null,
    scoreInput: '',
    examName: ''
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
      const userInfo = app.globalData.userInfo;
      if (!userInfo) return;

      const teacher = await api.get('/teachers/user/' + userInfo.id);
      if (!teacher) return;

      const teacherClasses = await api.get('/teachers/' + teacher.id + '/classes');
      const classList = teacherClasses || [];
      const selectedClassId = classList.length > 0 ? classList[0].id : null;

      let classStudents = [];
      if (selectedClassId) {
        const students = await api.get('/classes/' + selectedClassId + '/students');
        classStudents = (students || []).map(student => {
          const scores = [
            { name: '第一次月考', score: Math.floor(Math.random() * 40) + 60 },
            { name: '期中考试', score: Math.floor(Math.random() * 40) + 60 },
            { name: '第二次月考', score: Math.floor(Math.random() * 40) + 60 }
          ];
          const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
          return { ...student, scores, avgScore };
        });
      }

      const totalAvg = classStudents.length > 0
        ? Math.round(classStudents.reduce((sum, s) => sum + s.avgScore, 0) / classStudents.length)
        : 0;

      const topStudents = classStudents.slice(0, 5).map((student, index) => ({
        ...student,
        rankChange: Math.floor(Math.random() * 10) + 1
      }));

      this.setData({
        teacherClasses: classList,
        selectedClassId: selectedClassId,
        classStudents: classStudents,
        topStudents: topStudents,
        currentClassAvgScore: totalAvg
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

  async selectClass(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedClassId: id
    });

    try {
      const students = await api.get('/classes/' + id + '/students');
      const classStudents = (students || []).map(student => {
        const scores = [
          { name: '第一次月考', score: Math.floor(Math.random() * 40) + 60 },
          { name: '期中考试', score: Math.floor(Math.random() * 40) + 60 },
          { name: '第二次月考', score: Math.floor(Math.random() * 40) + 60 }
        ];
        const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
        return { ...student, scores, avgScore };
      });

      const totalAvg = classStudents.length > 0
        ? Math.round(classStudents.reduce((sum, s) => sum + s.avgScore, 0) / classStudents.length)
        : 0;

      const topStudents = classStudents.slice(0, 5).map((student, index) => ({
        ...student,
        rankChange: Math.floor(Math.random() * 10) + 1
      }));

      this.setData({
        classStudents: classStudents,
        topStudents: topStudents,
        currentClassAvgScore: totalAvg
      });
    } catch (err) {
    }
  },

  openInputModal(e) {
    const student = e.currentTarget.dataset.student;
    this.setData({
      showInputModal: true,
      currentStudent: student,
      scoreInput: '',
      examName: ''
    });
  },

  closeInputModal() {
    this.setData({
      showInputModal: false,
      currentStudent: null
    });
  },

  onExamNameInput(e) {
    this.setData({
      examName: e.detail.value
    });
  },

  onScoreInput(e) {
    this.setData({
      scoreInput: e.detail.value
    });
  },

  async submitScore() {
    const { examName, scoreInput, currentStudent, classInfo } = this.data;
    if (!examName || !scoreInput) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    try {
      await api.post('/grades', {
        student_id: currentStudent.id,
        class_id: classInfo.id,
        course_id: classInfo.course_id,
        teacher_id: classInfo.teacher_id,
        exam_type: examName,
        score: parseFloat(scoreInput),
        max_score: 100
      });
      wx.showToast({
        title: '成绩录入成功',
        icon: 'success'
      });
      this.closeInputModal();
      this.loadData();
    } catch (err) {
      wx.showToast({
        title: '录入失败',
        icon: 'none'
      });
    }
  },

  viewScoreDetail(e) {
    const student = e.currentTarget.dataset.student;
    wx.showToast({
      title: '查看成绩详情',
      icon: 'none'
    });
  },

  exportScores() {
    wx.showToast({
      title: '导出成绩表',
      icon: 'none'
    });
  },

  publishScores() {
    wx.showToast({
      title: '发布成绩',
      icon: 'none'
    });
  }
});
