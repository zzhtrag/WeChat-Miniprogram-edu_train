/**
 * Mock 方法 - 教师端 + 家长端快捷方法 + 认证 + 统计
 */
module.exports = {
  // ==================== 教师端快捷方法 ====================
  getTeacherClasses(teacherId) {
    return this.getClasses({ teacher_id: teacherId, status: 'active' });
  },

  getTeacherStudents(teacherId, filters = {}) {
    const classes = this.getTeacherClasses(teacherId);
    const classIds = classes.map(c => c.id);

    let students = [];
    classIds.forEach(classId => {
      const classStudents = this.getClassStudents(classId);
      students = students.concat(classStudents.map(s => ({
        ...s,
        class_id: classId,
        class_name: classes.find(c => c.id === classId)?.name || ''
      })));
    });

    const uniqueStudents = [];
    const seenIds = new Set();
    students.forEach(s => {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        uniqueStudents.push(s);
      }
    });

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      return uniqueStudents.filter(s => s.name.includes(keyword) || s.student_no.includes(keyword));
    }
    if (filters.status) return uniqueStudents.filter(s => s.status === filters.status);
    if (filters.grade) return uniqueStudents.filter(s => s.grade === filters.grade);

    return uniqueStudents;
  },

  getTeacherSchedules(teacherId, filters = {}) {
    return this.getSchedules({ teacher_id: teacherId, ...filters });
  },

  getTeacherAttendances(teacherId, filters = {}) {
    const classes = this.getTeacherClasses(teacherId);
    const classIds = classes.map(c => c.id);

    let attendances = this.attendances.filter(a => classIds.includes(a.class_id));
    if (filters.date) attendances = attendances.filter(a => {
      const schedule = this.schedules.find(s => s.id === a.schedule_id);
      return schedule && schedule.date === filters.date;
    });

    return attendances.map(a => {
      const student = this.students.find(s => s.id === a.student_id);
      const schedule = this.schedules.find(s => s.id === a.schedule_id);
      return {
        ...a,
        student_name: student ? student.name : '',
        schedule_date: schedule ? schedule.date : '',
        schedule_time: schedule ? `${schedule.start_time}-${schedule.end_time}` : ''
      };
    });
  },

  getTeacherAssignments(teacherId) {
    return this.getAssignments({ teacher_id: teacherId });
  },

  getTeacherMessages(teacherId) {
    const user = this.users.find(u => u.id === teacherId || u.id === 'teacher001');
    if (!user) return [];

    const messages = this.messages
      .filter(m => m.receiver_id === user.id || m.receiver_id === 'teacher001')
      .map(msg => {
        let senderName = '系统通知';
        if (msg.sender_type === 'admin') {
          const admin = this.users.find(u => u.id === msg.sender_id);
          senderName = admin ? admin.name : '管理员';
        } else if (msg.sender_type === 'parent') {
          const parent = this.parents.find(p => p.id === msg.sender_id || p.user_id === msg.sender_id);
          senderName = parent ? parent.name : '家长';
        }

        let iconClass = 'icon-system';
        if (msg.type === 'parent') {
          iconClass = 'icon-parent';
        } else if (msg.type === 'task') {
          iconClass = 'icon-task';
        }

        return {
          ...msg,
          sender_name: senderName,
          icon_class: iconClass,
          time_str: this.formatTime(msg.created_at)
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return messages;
  },

  formatTime(timeStr) {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = now - time;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 7 * oneDay) return Math.floor(diff / oneDay) + '天前';

    return time.getMonth() + 1 + '月' + time.getDate() + '日';
  },

  markMessageRead(messageId) {
    const index = this.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      this.messages[index].is_read = true;
      return true;
    }
    return false;
  },

  markAllMessagesRead(teacherId) {
    this.messages.forEach(msg => {
      if (msg.receiver_id === teacherId || msg.receiver_id === 'teacher001') {
        msg.is_read = true;
      }
    });
  },

  // ==================== 家长端快捷方法 ====================
  getParentStudents(parentIdOrUserId) {
    let parent = this.parents.find(p => p.id === parentIdOrUserId);
    if (!parent) {
      parent = this.parents.find(p => p.user_id === parentIdOrUserId);
    }
    if (!parent) return [];

    const children = this.students.filter(s => s.parent_id === parent.id);

    return children.map(student => {
      const enrollments = this.getStudentEnrollments(student.id);
      return {
        ...student,
        relation: parent.relation,
        enrollments: enrollments
      };
    });
  },

  getStudentSchedules(studentId) {
    const enrollments = this.enrollments.filter(e => e.student_id === studentId && e.status === 'active');
    const classIds = enrollments.map(e => e.class_id);

    let result = this.schedules.filter(s => classIds.includes(s.class_id)).map(schedule => {
      const classItem = this.getClassById(schedule.class_id);
      const teacher = this.teachers.find(t => t.id === schedule.teacher_id);
      const date = new Date(schedule.date);
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

      return {
        ...schedule,
        class_name: classItem ? classItem.name : '',
        course_name: classItem ? classItem.course_name : '',
        teacher_name: teacher ? teacher.name : '',
        week_day: weekDays[date.getDay()]
      };
    });

    if (studentId === 's001') {
      const dynamicSchedules = this._getStudentXiaomingWeekSchedule().map(schedule => {
        const classItem = this.getClassById(schedule.class_id);
        const teacher = this.teachers.find(t => t.id === schedule.teacher_id);
        const date = new Date(schedule.date);
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        return {
          ...schedule,
          class_name: classItem ? classItem.name : '',
          course_name: classItem ? classItem.course_name : '',
          teacher_name: teacher ? teacher.name : '',
          week_day: weekDays[date.getDay()]
        };
      });
      result = [...result, ...dynamicSchedules];
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  },

  getStudentAssignments(studentId) {
    const enrollments = this.enrollments.filter(e => e.student_id === studentId && e.status === 'active');
    const classIds = enrollments.map(e => e.class_id);

    return this.assignments.filter(a => classIds.includes(a.class_id)).map(assignment => {
      const submission = this.submissions.find(
        s => s.assignment_id === assignment.id && s.student_id === studentId
      );
      const course = this.courses.find(c => c.id === assignment.course_id);
      const teacher = this.teachers.find(t => t.id === assignment.teacher_id);

      return {
        ...assignment,
        course_name: course ? course.name : '',
        teacher_name: teacher ? teacher.name : '',
        submit_status: submission ? submission.status : 'pending',
        score: submission ? submission.score : null,
        feedback: submission ? submission.feedback : ''
      };
    }).sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  },

  getStudentAttendances(studentId) {
    return this.getAttendances({ student_id: studentId });
  },

  getStudentGrades(studentId) {
    return this.getGrades({ student_id: studentId });
  },

  // ==================== 登录认证相关方法 ====================
  getUserRolesByPhone(phone) {
    const user = this.users.find(u => u.phone === phone);
    if (!user) return null;

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      roles: [user.role]
    };
  },

  // ==================== 统计数据 ====================
  getAdminStats() {
    const teachers = this.getTeachers();
    const students = this.getStudents();
    const classes = this.getClasses();
    const courses = this.getCourses();

    const activeClasses = classes.filter(c => c.status === 'active').length;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthNewStudents = students.filter(s => s.created_at >= monthStart).length;
    const monthNewTeachers = teachers.filter(t => t.created_at >= monthStart).length;

    return {
      teacherCount: teachers.length,
      studentCount: students.length,
      classCount: classes.length,
      courseCount: courses.length,
      activeClasses: activeClasses,
      monthNewStudents: monthNewStudents,
      monthNewTeachers: monthNewTeachers
    };
  }
};
