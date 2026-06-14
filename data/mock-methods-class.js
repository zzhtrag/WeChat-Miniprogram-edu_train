/**
 * Mock 方法 - 班级 + 课程 + 选课 + 排课
 */
module.exports = {
  // ==================== 班级相关方法 ====================
  getClasses(filters = {}) {
    let result = this.classes.map(classItem => {
      const course = this.courses.find(c => c.id === classItem.course_id);
      const teacher = this.teachers.find(t => t.id === classItem.teacher_id);
      const studentCount = this.enrollments.filter(e => e.class_id === classItem.id && e.status === 'active').length;

      return {
        ...classItem,
        course_name: course ? course.name : '',
        course_subject: course ? course.subject : '',
        teacher_name: teacher ? teacher.name : '',
        teacher_avatar: teacher ? teacher.avatar : '',
        current_students: studentCount,
        full_rate: Math.round((studentCount / classItem.capacity) * 100)
      };
    });

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(c => c.name.includes(keyword) || (c.course_name && c.course_name.includes(keyword)));
    }
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (filters.teacher_id) result = result.filter(c => c.teacher_id === filters.teacher_id);

    return result;
  },

  getClassById(classId) {
    const classItem = this.classes.find(c => c.id === classId);
    if (!classItem) return null;

    const course = this.courses.find(c => c.id === classItem.course_id);
    const teacher = this.teachers.find(t => t.id === classItem.teacher_id);
    const studentCount = this.enrollments.filter(e => e.class_id === classId && e.status === 'active').length;

    return {
      ...classItem,
      course_name: course ? course.name : '',
      course_subject: course ? course.subject : '',
      teacher_name: teacher ? teacher.name : '',
      teacher_avatar: teacher ? teacher.avatar : '',
      teacher_phone: teacher ? teacher.phone : '',
      current_students: studentCount,
      full_rate: Math.round((studentCount / classItem.capacity) * 100)
    };
  },

  getClassStudents(classId) {
    const enrollments = this.enrollments.filter(e => e.class_id === classId && e.status === 'active');
    return enrollments.map(e => {
      const student = this.students.find(s => s.id === e.student_id);
      const parent = student ? this.parents.find(p => p.id === student.parent_id) : null;
      return {
        ...student,
        parent_name: parent ? parent.name : '',
        parent_phone: parent ? parent.phone : '',
        enroll_time: e.enroll_time
      };
    });
  },

  addClass(classData) {
    const newClass = {
      id: 'cl' + Date.now(),
      name: classData.name,
      course_id: classData.course_id || null,
      teacher_id: classData.teacher_id,
      assistant_id: classData.assistant_id || null,
      room: classData.room || '',
      capacity: classData.capacity || 30,
      start_date: classData.start_date || '',
      end_date: classData.end_date || '',
      schedule: classData.schedule || '',
      remarks: classData.remarks || '',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    this.classes.push(newClass);
    return newClass;
  },

  updateClass(classId, classData) {
    const index = this.classes.findIndex(c => c.id === classId);
    if (index !== -1) {
      this.classes[index] = { ...this.classes[index], ...classData };
      return this.classes[index];
    }
    return null;
  },

  deleteClass(classId) {
    const index = this.classes.findIndex(c => c.id === classId);
    if (index !== -1) {
      this.enrollments = this.enrollments.filter(e => e.class_id !== classId);
      this.schedules = this.schedules.filter(s => s.class_id !== classId);
      this.classes.splice(index, 1);
      return true;
    }
    return false;
  },

  updateClassStatus(classId, status) {
    const index = this.classes.findIndex(c => c.id === classId);
    if (index !== -1) {
      this.classes[index].status = status;
      return true;
    }
    return false;
  },

  getClassSchedules(classId) {
    return this.getSchedules({ class_id: classId });
  },

  // ==================== 课程相关方法 ====================
  getCourses(filters = {}) {
    let result = this.courses.map(course => {
      const classCount = this.classes.filter(c => c.course_id === course.id && c.status === 'active').length;
      const classIds = this.classes.filter(c => c.course_id === course.id).map(c => c.id);
      const studentCount = this.enrollments.filter(e => classIds.includes(e.class_id) && e.status === 'active').length;

      return {
        ...course,
        class_count: classCount,
        student_count: studentCount
      };
    });

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(c => c.name.includes(keyword) || c.subject.includes(keyword));
    }
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (filters.subject) result = result.filter(c => c.subject === filters.subject);

    return result;
  },

  getCourseById(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return null;

    const classIds = this.classes.filter(c => c.course_id === courseId).map(c => c.id);
    const teacherIds = [...new Set(this.classes.filter(c => c.course_id === courseId).map(c => c.teacher_id))];
    const teachers = this.teachers.filter(t => teacherIds.includes(t.id));

    return {
      ...course,
      class_count: classIds.length,
      student_count: this.enrollments.filter(e => classIds.includes(e.class_id) && e.status === 'active').length,
      teachers: teachers
    };
  },

  addCourse(courseData) {
    const newCourse = {
      id: 'c' + Date.now(),
      name: courseData.name,
      subject: courseData.subject,
      description: courseData.description || '',
      textbook: courseData.textbook || '',
      capacity: courseData.capacity || 30,
      is_open: courseData.is_open !== false,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    this.courses.push(newCourse);
    return newCourse;
  },

  updateCourse(courseId, courseData) {
    const index = this.courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...courseData };
      return this.courses[index];
    }
    return null;
  },

  updateCourseStatus(courseId, newStatus) {
    const index = this.courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
      this.courses[index].status = newStatus;
      return this.courses[index];
    }
    return null;
  },

  deleteCourse(courseId) {
    const index = this.courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
      const hasClasses = this.classes.some(c => c.course_id === courseId);
      if (hasClasses) return { success: false, error: '该课程有关联班级，无法删除' };
      this.courses.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: '课程不存在' };
  },

  // ==================== 选课相关方法 ====================
  addEnrollment(enrollmentData) {
    const exists = this.enrollments.find(
      e => e.student_id === enrollmentData.student_id && e.class_id === enrollmentData.class_id
    );
    if (exists) return { success: false, error: '该学生已选此班级' };

    const classItem = this.classes.find(c => c.id === enrollmentData.class_id);
    if (!classItem) return { success: false, error: '班级不存在' };

    const currentCount = this.enrollments.filter(e => e.class_id === enrollmentData.class_id && e.status === 'active').length;
    if (currentCount >= classItem.capacity) return { success: false, error: '班级已满员' };

    const newEnrollment = {
      id: 'e' + Date.now(),
      student_id: enrollmentData.student_id,
      class_id: enrollmentData.class_id,
      course_id: enrollmentData.course_id || classItem.course_id,
      status: 'active',
      enroll_time: new Date().toISOString(),
      approve_time: new Date().toISOString()
    };
    this.enrollments.push(newEnrollment);
    return { success: true, enrollment: newEnrollment };
  },

  removeEnrollment(enrollmentId) {
    const index = this.enrollments.findIndex(e => e.id === enrollmentId);
    if (index !== -1) {
      this.enrollments.splice(index, 1);
      return true;
    }
    return false;
  },

  // ==================== 排课相关方法 ====================
  getSchedules(filters = {}) {
    let result = this.schedules.map(schedule => {
      const classItem = this.getClassById(schedule.class_id);
      const course = this.courses.find(c => c.id === schedule.course_id);
      const teacher = this.teachers.find(t => t.id === schedule.teacher_id);
      const date = new Date(schedule.date);
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

      return {
        ...schedule,
        class_name: classItem ? classItem.name : '',
        course_name: course ? course.name : '',
        teacher_name: teacher ? teacher.name : '',
        week_day: weekDays[date.getDay()],
        date_str: schedule.date
      };
    });

    if (filters.teacher_id === 't001') {
      const weekSchedules = this._getTeacherWangWeekSchedule().map(schedule => {
        const classItem = this.getClassById(schedule.class_id);
        const course = this.courses.find(c => c.id === schedule.course_id);
        const teacher = this.teachers.find(t => t.id === schedule.teacher_id);
        const date = new Date(schedule.date);
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        return {
          ...schedule,
          class_name: classItem ? classItem.name : '',
          course_name: course ? course.name : '',
          teacher_name: teacher ? teacher.name : '',
          week_day: weekDays[date.getDay()],
          date_str: schedule.date
        };
      });
      result = [...result, ...weekSchedules];
    }

    if (filters.class_id === 'cl001' || filters.student_id === 's001') {
      const xiaomingSchedules = this._getStudentXiaomingWeekSchedule().map(schedule => {
        const classItem = this.getClassById(schedule.class_id);
        const course = this.courses.find(c => c.id === schedule.course_id);
        const teacher = this.teachers.find(t => t.id === schedule.teacher_id);
        const date = new Date(schedule.date);
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        return {
          ...schedule,
          class_name: classItem ? classItem.name : '',
          course_name: course ? course.name : '',
          teacher_name: teacher ? teacher.name : '',
          week_day: weekDays[date.getDay()],
          date_str: schedule.date
        };
      });
      result = [...result, ...xiaomingSchedules];
    }

    if (filters.teacher_id) result = result.filter(s => s.teacher_id === filters.teacher_id);
    if (filters.class_id) result = result.filter(s => s.class_id === filters.class_id);
    if (filters.status) result = result.filter(s => s.status === filters.status);
    if (filters.date) result = result.filter(s => s.date === filters.date);
    if (filters.start_date && filters.end_date) {
      result = result.filter(s => s.date >= filters.start_date && s.date <= filters.end_date);
    }

    return result;
  },

  getScheduleById(scheduleId) {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (!schedule) return null;

    const classItem = this.getClassById(schedule.class_id);
    const students = this.getClassStudents(schedule.class_id);

    return {
      ...schedule,
      class_name: classItem ? classItem.name : '',
      course_name: classItem ? classItem.course_name : '',
      teacher_name: classItem ? classItem.teacher_name : '',
      students: students
    };
  },

  addSchedule(scheduleData) {
    const newSchedule = {
      id: 'sch' + Date.now(),
      class_id: scheduleData.class_id,
      course_id: scheduleData.course_id,
      teacher_id: scheduleData.teacher_id,
      room: scheduleData.room || '',
      date: scheduleData.date,
      start_time: scheduleData.start_time || '09:00',
      end_time: scheduleData.end_time || '11:00',
      duration: scheduleData.duration || 2,
      status: 'scheduled',
      remarks: scheduleData.remarks || '',
      created_at: new Date().toISOString()
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  },

  updateSchedule(scheduleId, scheduleData) {
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      this.schedules[index] = { ...this.schedules[index], ...scheduleData };
      return this.schedules[index];
    }
    return null;
  },

  deleteSchedule(scheduleId) {
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      this.schedules.splice(index, 1);
      return true;
    }
    return false;
  }
};
