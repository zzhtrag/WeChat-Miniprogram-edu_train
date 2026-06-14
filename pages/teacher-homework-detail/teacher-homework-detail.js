const api = require('../../utils/api.js');

Page({
  data: {
    assignment: null,
    classInfo: null,
    courseInfo: null,
    totalStudents: 0,
    submittedCount: 0,
    gradedCount: 0,
    submissionList: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.assignmentId = options.id;
      this.loadData();
    }
  },

  onShow() {
    // Refresh data when returning from grade page
    if (this.assignmentId) {
      this.loadData();
    }
  },

  async loadData() {
    try {
      const assignment = await api.get('/assignments/' + this.assignmentId);
      if (!assignment) {
        this.setData({ loading: false });
        return;
      }

      const [classInfo, courseInfo, students, allSubmissions] = await Promise.all([
        api.get('/classes/' + assignment.class_id),
        api.get('/courses/' + assignment.course_id),
        api.get('/classes/' + assignment.class_id + '/students'),
        api.get('/submissions')
      ]);

      // Determine assignment status
      const now = new Date();
      const deadline = new Date(assignment.deadline);
      let statusText = '进行中';
      let statusColor = '#1677ff';
      if (now > deadline) {
        statusText = '已截止';
        statusColor = '#999';
      }
      if (assignment.status === 'closed') {
        statusText = '已关闭';
        statusColor = '#999';
      }

      // Build submission list by matching students with submissions
      const submissions = (allSubmissions || []).filter(
        s => s.assignment_id === this.assignmentId
      );

      const submissionMap = {};
      submissions.forEach(s => {
        submissionMap[s.student_id] = s;
      });

      const studentList = students || [];
      const submissionList = studentList.map(student => {
        const submission = submissionMap[student.id];
        let status = 'pending';
        let statusLabel = '未提交';
        let score = null;
        let comment = '';
        let submitTime = '';
        let images = [];

        if (submission) {
          submitTime = submission.submit_time;
          images = submission.attachments || [];
          if (submission.status === 'graded') {
            status = 'graded';
            statusLabel = '已批改';
            score = submission.score;
            comment = submission.feedback;
          } else {
            // Check if late
            const submitDate = new Date(submission.submit_time);
            if (submitDate > deadline) {
              status = 'late';
              statusLabel = '迟交';
            } else {
              status = 'submitted';
              statusLabel = '已提交';
            }
          }
        }

        return {
          student_id: student.id,
          student_name: student.name,
          student_no: student.student_no,
          status: status,
          statusLabel: statusLabel,
          score: score,
          comment: comment,
          submitTime: submitTime,
          images: images,
          content: submission ? submission.content : '',
          submission_id: submission ? submission.id : ''
        };
      });

      const totalStudents = studentList.length;
      const submittedCount = submissions.length;
      const gradedCount = submissions.filter(s => s.status === 'graded').length;

      // Format deadline display
      const deadlineStr = assignment.deadline;

      this.setData({
        assignment: {
          ...assignment,
          statusText: statusText,
          statusColor: statusColor,
          deadlineStr: deadlineStr
        },
        classInfo: classInfo,
        courseInfo: courseInfo,
        totalStudents: totalStudents,
        submittedCount: submittedCount,
        gradedCount: gradedCount,
        submissionList: submissionList,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  viewSubmission(e) {
    const studentId = e.currentTarget.dataset.studentid;
    const status = e.currentTarget.dataset.status;
    if (status === 'pending') {
      wx.showToast({
        title: '该学生尚未提交',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/teacher-homework-grade/teacher-homework-grade?id=' + this.assignmentId + '&studentId=' + studentId
    });
  },

  gradeAll() {
    // Find the first ungraded submission and navigate to it
    const ungraded = this.data.submissionList.find(
      item => item.status === 'submitted' || item.status === 'late'
    );
    if (!ungraded) {
      wx.showToast({
        title: '没有待批改的作业',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/teacher-homework-grade/teacher-homework-grade?id=' + this.assignmentId + '&studentId=' + ungraded.student_id
    });
  },

  onBack() {
    wx.navigateBack();
  }
});
