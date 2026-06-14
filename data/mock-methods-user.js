/**
 * Mock 方法 - 登录验证 + 教师 + 学生 + 家长
 */
module.exports = {
  // ==================== 登录验证 ====================
  validateLogin(phone, password) {
    const user = this.users.find(u => u.phone === phone);
    if (!user) return { success: false, error: '用户不存在' };
    if (user.password !== password) return { success: false, error: '密码错误' };
    if (user.status !== 'active') return { success: false, error: '账号已被禁用' };
    return {
      success: true,
      userId: user.id,
      role: user.role,
      name: user.name,
      avatar: user.avatar
    };
  },

  getUserByPhone(phone) {
    return this.users.find(u => u.phone === phone);
  },

  getUserById(userId) {
    return this.users.find(u => u.id === userId);
  },

  // ==================== 教师相关方法 ====================
  getTeachers(filters = {}) {
    let result = this.teachers.map(teacher => {
      const user = this.users.find(u => u.id === teacher.user_id);
      const classCount = this.classes.filter(c => c.teacher_id === teacher.id && c.status === 'active').length;
      const classIds = this.classes.filter(c => c.teacher_id === teacher.id).map(c => c.id);
      const studentCount = this.enrollments.filter(e => classIds.includes(e.class_id) && e.status === 'active').length;
      return {
        ...teacher,
        phone: user ? user.phone : teacher.phone,
        status: user ? user.status : teacher.status,
        class_count: classCount,
        student_count: studentCount
      };
    });

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(t => t.name.includes(keyword) || t.employee_no.includes(keyword) || t.phone.includes(keyword));
    }
    if (filters.status) result = result.filter(t => t.status === filters.status);
    if (filters.subject) result = result.filter(t => t.subjects.includes(filters.subject));

    return result;
  },

  getTeacherById(teacherId) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return null;

    const user = this.users.find(u => u.id === teacher.user_id);
    const classIds = this.classes.filter(c => c.teacher_id === teacherId).map(c => c.id);
    const classCount = classIds.length;
    const studentCount = this.enrollments.filter(e => classIds.includes(e.class_id) && e.status === 'active').length;

    return {
      ...teacher,
      phone: user ? user.phone : teacher.phone,
      avatar: user ? user.avatar : teacher.avatar,
      status: user ? user.status : teacher.status,
      class_count: classCount,
      student_count: studentCount
    };
  },

  getTeacherByUserId(userId) {
    return this.teachers.find(t => t.user_id === userId);
  },

  addTeacher(teacherData) {
    const newTeacher = {
      id: 't' + Date.now(),
      user_id: null,
      employee_no: 'T' + Date.now(),
      name: teacherData.name,
      phone: teacherData.phone || '',
      email: teacherData.email || '',
      avatar: teacherData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      subjects: teacherData.subjects || [],
      grade: teacherData.grade || '',
      education: teacherData.education || '',
      school: teacherData.school || '',
      entry_date: teacherData.entry_date || new Date().toISOString().split('T')[0],
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    this.teachers.push(newTeacher);
    return newTeacher;
  },

  updateTeacher(teacherId, teacherData) {
    const index = this.teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
      this.teachers[index] = { ...this.teachers[index], ...teacherData };
      return this.teachers[index];
    }
    return null;
  },

  deleteTeacher(teacherId) {
    const index = this.teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
      const hasClasses = this.classes.some(c => c.teacher_id === teacherId);
      if (hasClasses) return { success: false, error: '该教师有关联班级，无法删除' };
      this.teachers.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: '教师不存在' };
  },

  // ==================== 学生相关方法 ====================
  getStudents(filters = {}) {
    let result = this.students.map(student => {
      const parent = this.parents.find(p => p.id === student.parent_id);
      const enrollments = this.enrollments.filter(e => e.student_id === student.id && e.status === 'active');
      const classIds = enrollments.map(e => e.class_id);
      const classes = this.classes.filter(c => classIds.includes(c.id));
      const courseIds = enrollments.map(e => e.course_id);
      const courses = this.courses.filter(c => courseIds.includes(c.id));

      return {
        ...student,
        parent_name: parent ? parent.name : '',
        parent_phone: parent ? parent.phone : '',
        relation: parent ? parent.relation : '',
        class_names: classes.map(c => c.name),
        course_names: courses.map(c => c.name),
        class_count: classes.length
      };
    });

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(s => s.name.includes(keyword) || s.student_no.includes(keyword) || s.grade.includes(keyword));
    }
    if (filters.parent_id) result = result.filter(s => s.parent_id === filters.parent_id);
    if (filters.status) result = result.filter(s => s.status === filters.status);
    if (filters.grade) result = result.filter(s => s.grade === filters.grade);

    return result;
  },

  getStudentById(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return null;

    const parent = this.parents.find(p => p.id === student.parent_id);
    const enrollments = this.enrollments.filter(e => e.student_id === studentId && e.status === 'active');

    return {
      ...student,
      parent_name: parent ? parent.name : '',
      parent_phone: parent ? parent.phone : '',
      parent_relation: parent ? parent.relation : '',
      enrollment_count: enrollments.length
    };
  },

  addStudent(studentData) {
    const classIds = studentData.class_ids || [];
    delete studentData.class_ids;

    const newStudent = {
      id: 's' + Date.now(),
      student_no: 'S' + Date.now(),
      name: studentData.name,
      gender: studentData.gender || 'male',
      birthday: studentData.birthday || '',
      grade: studentData.grade,
      parent_id: studentData.parent_id || null,
      address: studentData.address || '',
      tags: studentData.tags || [],
      remarks: studentData.remarks || '',
      status: 'active',
      enrolled_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0],
      class_ids: classIds
    };
    this.students.push(newStudent);

    // 创建 enrollment
    classIds.forEach(classId => {
      const classItem = this.classes.find(c => c.id === classId);
      if (classItem) {
        this.enrollments.push({
          id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
          student_id: newStudent.id,
          class_id: classId,
          course_id: classItem.course_id,
          status: 'active',
          enroll_time: new Date().toISOString(),
          approve_time: new Date().toISOString()
        });
      }
    });

    return newStudent;
  },

  updateStudent(studentId, studentData) {
    const classIds = studentData.class_ids;
    delete studentData.class_ids;

    const index = this.students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...studentData };

      // 同步 enrollment
      if (classIds !== undefined) {
        this.enrollments = this.enrollments.filter(e => e.student_id !== studentId);
        classIds.forEach(classId => {
          const classItem = this.classes.find(c => c.id === classId);
          if (classItem) {
            this.enrollments.push({
              id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
              student_id: studentId,
              class_id: classId,
              course_id: classItem.course_id,
              status: 'active',
              enroll_time: new Date().toISOString(),
              approve_time: new Date().toISOString()
            });
          }
        });
        this.students[index].class_ids = classIds;
      }

      return this.students[index];
    }
    return null;
  },

  deleteStudent(studentId) {
    const index = this.students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      this.students.splice(index, 1);
      this.enrollments = this.enrollments.filter(e => e.student_id !== studentId);
      return true;
    }
    return false;
  },

  updateStudentStatus(studentId, status) {
    const index = this.students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      this.students[index].status = status;
      return true;
    }
    return false;
  },

  // ==================== 家长相关方法 ====================
  getParents(filters = {}) {
    let result = this.parents.map(parent => {
      const user = this.users.find(u => u.id === parent.user_id);
      const studentCount = this.students.filter(s => s.parent_id === parent.id).length;
      return {
        ...parent,
        phone: user ? user.phone : parent.phone,
        status: user ? user.status : parent.status,
        student_count: studentCount
      };
    });

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(p => p.name.includes(keyword) || (p.phone && p.phone.includes(keyword)));
    }
    if (filters.user_id) result = result.filter(p => p.user_id === filters.user_id);
    if (filters.status) result = result.filter(p => p.status === filters.status);

    return result;
  },

  getParentById(parentId) {
    const parent = this.parents.find(p => p.id === parentId);
    if (!parent) return null;

    const user = this.users.find(u => u.id === parent.user_id);
    const children = this.students.filter(s => s.parent_id === parentId);

    return {
      ...parent,
      phone: user ? user.phone : parent.phone,
      status: user ? user.status : parent.status,
      child_count: children.length
    };
  },

  addParent(parentData) {
    const newParent = {
      id: 'p' + Date.now(),
      user_id: null,
      name: parentData.name,
      phone: parentData.phone || '',
      relation: parentData.relation || '',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    this.parents.push(newParent);
    return newParent;
  },

  updateParent(parentId, parentData) {
    const index = this.parents.findIndex(p => p.id === parentId);
    if (index !== -1) {
      this.parents[index] = { ...this.parents[index], ...parentData };
      return this.parents[index];
    }
    return null;
  },

  // ==================== 学员关联数据方法 ====================
  getStudentClasses(studentId) {
    const enrollments = this.enrollments.filter(e => e.student_id === studentId && e.status === 'active');
    return enrollments.map(e => {
      const classItem = this.getClassById(e.class_id);
      const course = classItem ? this.courses.find(c => c.id === classItem.course_id) : null;
      return {
        ...classItem,
        course_name: course ? course.name : '',
        enroll_time: e.enroll_time
      };
    });
  },

  getStudentEnrollments(studentId) {
    const enrollments = this.enrollments.filter(e => e.student_id === studentId);
    return enrollments.map(e => {
      const course = this.courses.find(c => c.id === e.course_id);
      const classItem = this.classes.find(c => c.id === e.class_id);
      const teacher = classItem ? this.teachers.find(t => t.id === classItem.teacher_id) : null;
      return {
        ...e,
        course_name: course ? course.name : '',
        class_name: classItem ? classItem.name : '',
        teacher_name: teacher ? teacher.name : ''
      };
    });
  },

  getStudentHomework(studentId) {
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

  updateUser(userId, userData) {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...userData };
      return this.users[index];
    }
    return null;
  }
};
