const api = require('../../utils/api.js');

Page({
  data: {
    currentStudent: null,
    grades: [],
    courseAvgScores: [],
    overallStats: {}
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    setTimeout(() => wx.stopPullDownRefresh(), 1000);
  },

  async loadData() {
    const app = getApp();
    const currentStudent = app.globalData.currentStudent;

    if (!currentStudent) {
      this.setData({ currentStudent: null, grades: [], courseAvgScores: [], overallStats: {} });
      return;
    }

    try {
      const [allGrades, courses, teachers] = await Promise.all([
        api.get('/students/' + currentStudent.id + '/grades'),
        api.get('/courses'),
        api.get('/teachers')
      ]);

      const courseMap = {};
      courses.forEach(c => { courseMap[c.id] = c; });
      const teacherMap = {};
      teachers.forEach(t => { teacherMap[t.id] = t; });

      const grades = allGrades.map(g => {
        const course = courseMap[g.course_id];
        const teacher = teacherMap[g.teacher_id];

        return {
          id: g.id,
          courseName: course?.name || '课程',
          examType: g.exam_type,
          score: g.score,
          maxScore: g.max_score,
          percentage: Math.round((g.score / g.max_score) * 100),
          comment: g.comment || '',
          gradedAt: g.graded_at?.split(' ')[0] || '',
          teacherName: teacher?.name || ''
        };
      }).sort((a, b) => new Date(b.gradedAt) - new Date(a.gradedAt));

      const courseGroupMap = {};
      grades.forEach(g => {
        if (!courseGroupMap[g.courseName]) {
          courseGroupMap[g.courseName] = { total: 0, count: 0, scores: [] };
        }
        courseGroupMap[g.courseName].total += g.score;
        courseGroupMap[g.courseName].count++;
        courseGroupMap[g.courseName].scores.push(g);
      });

      const courseAvgScores = Object.entries(courseGroupMap).map(([name, data]) => ({
        courseName: name,
        avgScore: Math.round(data.total / data.count),
        examCount: data.count,
        latestScore: data.scores[0]
      }));

      const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
      const totalMax = grades.reduce((sum, g) => sum + g.max_score, 0);
      const overallStats = {
        avgScore: grades.length > 0 ? Math.round(totalScore / grades.length) : 0,
        totalExams: grades.length,
        highest: grades.length > 0 ? Math.max(...grades.map(g => g.score)) : 0,
        lowest: grades.length > 0 ? Math.min(...grades.map(g => g.score)) : 0,
        overallRate: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
      };

      this.setData({
        currentStudent,
        grades,
        courseAvgScores,
        overallStats
      });
    } catch (err) {
      wx.showToast({ title: '加载数据失败', icon: 'none' });
    }
  },

  getScoreLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'pass';
    return 'fail';
  },

  getProgressStyle(score) {
    let color = '#ff4d4f';
    if (score >= 90) color = '#52c41a';
    else if (score >= 60) color = '#1677ff';
    return 'width:' + score + '%;background:' + color;
  }
});
