/**
 * Mock 方法 - 考勤 + 成绩 + 作业 + 公告
 */
module.exports = {
  // ==================== 考勤相关方法 ====================
  getAttendances(filters = {}) {
    let result = this.attendances.map(att => {
      const student = this.students.find(s => s.id === att.student_id);
      const schedule = this.schedules.find(s => s.id === att.schedule_id);
      const classItem = schedule ? this.classes.find(c => c.id === schedule.class_id) : null;
      const course = schedule ? this.courses.find(c => c.id === schedule.course_id) : null;

      return {
        ...att,
        student_name: student ? student.name : '',
        student_no: student ? student.student_no : '',
        schedule_date: schedule ? schedule.date : '',
        schedule_time: schedule ? `${schedule.start_time}-${schedule.end_time}` : '',
        class_name: classItem ? classItem.name : '',
        course_name: course ? course.name : ''
      };
    });

    if (filters.student_id) result = result.filter(a => a.student_id === filters.student_id);
    if (filters.class_id) result = result.filter(a => a.class_id === filters.class_id);
    if (filters.schedule_id) result = result.filter(a => a.schedule_id === filters.schedule_id);
    if (filters.date) result = result.filter(a => a.schedule_date === filters.date);

    return result;
  },

  addAttendance(attendanceData) {
    const exists = this.attendances.find(
      a => a.schedule_id === attendanceData.schedule_id && a.student_id === attendanceData.student_id
    );
    if (exists) return { success: false, error: '已考勤' };

    const newAttendance = {
      id: 'att' + Date.now(),
      schedule_id: attendanceData.schedule_id,
      student_id: attendanceData.student_id,
      class_id: attendanceData.class_id,
      status: attendanceData.status || 'present',
      reason: attendanceData.reason || '',
      checkin_time: new Date().toISOString()
    };
    this.attendances.push(newAttendance);
    return { success: true, attendance: newAttendance };
  },

  // ==================== 成绩相关方法 ====================
  getGrades(filters = {}) {
    let result = this.grades.map(grade => {
      const student = this.students.find(s => s.id === grade.student_id);
      const course = this.courses.find(c => c.id === grade.course_id);
      const classItem = this.classes.find(c => c.id === grade.class_id);
      const teacher = this.teachers.find(t => t.id === grade.teacher_id);

      return {
        ...grade,
        student_name: student ? student.name : '',
        student_no: student ? student.student_no : '',
        course_name: course ? course.name : '',
        class_name: classItem ? classItem.name : '',
        teacher_name: teacher ? teacher.name : ''
      };
    });

    if (filters.student_id) result = result.filter(g => g.student_id === filters.student_id);
    if (filters.class_id) result = result.filter(g => g.class_id === filters.class_id);
    if (filters.course_id) result = result.filter(g => g.course_id === filters.course_id);

    return result;
  },

  addGrade(gradeData) {
    const newGrade = {
      id: 'g' + Date.now(),
      student_id: gradeData.student_id,
      class_id: gradeData.class_id,
      course_id: gradeData.course_id,
      teacher_id: gradeData.teacher_id,
      exam_type: gradeData.exam_type,
      score: gradeData.score,
      max_score: gradeData.max_score || 100,
      comment: gradeData.comment || '',
      graded_at: new Date().toISOString()
    };
    this.grades.push(newGrade);
    return newGrade;
  },

  // ==================== 作业相关方法 ====================
  getAssignments(filters = {}) {
    let result = this.assignments.map(assignment => {
      const course = this.courses.find(c => c.id === assignment.course_id);
      const classItem = this.classes.find(c => c.id === assignment.class_id);
      const teacher = this.teachers.find(t => t.id === assignment.teacher_id);
      const submissionCount = this.submissions.filter(s => s.assignment_id === assignment.id).length;

      return {
        ...assignment,
        course_name: course ? course.name : '',
        class_name: classItem ? classItem.name : '',
        teacher_name: teacher ? teacher.name : '',
        submit_count: submissionCount
      };
    });

    if (filters.teacher_id) result = result.filter(a => a.teacher_id === filters.teacher_id);
    if (filters.class_id) result = result.filter(a => a.class_id === filters.class_id);

    return result;
  },

  getAssignmentById(assignmentId) {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;

    const submissions = this.submissions.filter(s => s.assignment_id === assignmentId).map(s => {
      const student = this.students.find(st => st.id === s.student_id);
      return { ...s, student_name: student ? student.name : '' };
    });

    return {
      ...assignment,
      submissions: submissions,
      submit_count: submissions.length,
      graded_count: submissions.filter(s => s.status === 'graded').length
    };
  },

  addAssignment(assignmentData) {
    const newAssignment = {
      id: 'h' + Date.now(),
      class_id: assignmentData.class_id,
      course_id: assignmentData.course_id,
      teacher_id: assignmentData.teacher_id,
      title: assignmentData.title,
      content: assignmentData.content,
      attachments: assignmentData.attachments || [],
      deadline: assignmentData.deadline,
      is_notified: false,
      status: 'published',
      created_at: new Date().toISOString()
    };
    this.assignments.push(newAssignment);
    return newAssignment;
  },

  submitHomework(submissionData) {
    const newSubmission = {
      id: 'sub' + Date.now(),
      assignment_id: submissionData.assignment_id,
      student_id: submissionData.student_id,
      content: submissionData.content,
      attachments: submissionData.attachments || [],
      score: null,
      feedback: '',
      submit_time: new Date().toISOString(),
      grade_time: null,
      status: 'submitted'
    };
    this.submissions.push(newSubmission);
    return newSubmission;
  },

  gradeHomework(submissionId, score, feedback) {
    const index = this.submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      this.submissions[index].score = score;
      this.submissions[index].feedback = feedback;
      this.submissions[index].grade_time = new Date().toISOString();
      this.submissions[index].status = 'graded';
      return this.submissions[index];
    }
    return null;
  },

  // ==================== 公告相关方法 ====================
  getAnnouncements(filters = {}) {
    let result = this.announcements.map(ann => {
      const publisher = this.users.find(u => u.id === ann.publisher_id);
      return {
        ...ann,
        publisher_name: publisher ? publisher.name : '管理员'
      };
    });

    if (filters.type) result = result.filter(a => a.type === filters.type);
    if (filters.status) result = result.filter(a => a.status === filters.status);
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(a => a.title.includes(keyword) || a.content.includes(keyword));
    }

    result.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return result;
  },

  getAnnouncementById(announcementId) {
    const announcement = this.announcements.find(a => a.id === announcementId);
    if (!announcement) return null;

    const publisher = this.users.find(u => u.id === announcement.publisher_id);
    return {
      ...announcement,
      publisher_name: publisher ? publisher.name : '管理员'
    };
  },

  addAnnouncement(announcementData) {
    const newAnnouncement = {
      id: 'a' + Date.now(),
      title: announcementData.title,
      content: announcementData.content,
      type: announcementData.type || 'system',
      target_grade: announcementData.target_grade || null,
      is_pinned: announcementData.is_pinned || false,
      schedule_time: announcementData.schedule_time || null,
      expire_time: announcementData.expire_time || null,
      publisher_id: announcementData.publisher_id || 'admin001',
      status: announcementData.status || 'draft',
      created_at: new Date().toISOString()
    };
    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  },

  updateAnnouncement(announcementId, announcementData) {
    const index = this.announcements.findIndex(a => a.id === announcementId);
    if (index !== -1) {
      this.announcements[index] = { ...this.announcements[index], ...announcementData };
      return this.announcements[index];
    }
    return null;
  },

  deleteAnnouncement(announcementId) {
    const index = this.announcements.findIndex(a => a.id === announcementId);
    if (index !== -1) {
      this.announcements.splice(index, 1);
      return true;
    }
    return false;
  },

  toggleAnnouncementPin(announcementId) {
    const index = this.announcements.findIndex(a => a.id === announcementId);
    if (index !== -1) {
      this.announcements[index].is_pinned = !this.announcements[index].is_pinned;
      return this.announcements[index];
    }
    return null;
  }
};
