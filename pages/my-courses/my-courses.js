const api = require('../../utils/api.js');

Page({
  data: {
    currentStudent: null,
    courses: [],
    loading: true
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
      this.setData({ currentStudent: null, courses: [], loading: false });
      return;
    }

    this.setData({ loading: true });

    try {
      const enrollments = await api.get('/students/' + currentStudent.id + '/enrollments');

      if (!enrollments || enrollments.length === 0) {
        this.setData({
          currentStudent,
          courses: [],
          loading: false
        });
        return;
      }

      // Fetch related data for each enrollment
      const classIds = enrollments.map(e => e.class_id);
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];

      const [allClasses, allCourses, allTeachers, allEnrollments] = await Promise.all([
        Promise.all(classIds.map(id => api.get('/classes/' + id))),
        Promise.all(courseIds.map(id => api.get('/courses/' + id))),
        api.get('/teachers'),
        api.get('/enrollments')
      ]);

      // Build lookup maps
      const classMap = {};
      allClasses.forEach(c => { if (c) classMap[c.id] = c; });
      const courseMap = {};
      allCourses.forEach(c => { if (c) courseMap[c.id] = c; });

      // Fetch schedules for each class
      const scheduleResults = await Promise.all(
        classIds.map(id => api.get('/schedules', { class_id: id }).catch(() => []))
      );
      const scheduleMap = {};
      classIds.forEach((id, i) => { scheduleMap[id] = scheduleResults[i] || []; });

      const courses = enrollments.map(enrollment => {
        const classInfo = classMap[enrollment.class_id];
        const course = courseMap[enrollment.course_id];
        const teacher = (allTeachers || []).find(t => t.id === classInfo?.teacher_id);

        const studentCount = (allEnrollments || []).filter(e => e.class_id === enrollment.class_id && e.status === 'active').length;

        const schedules = scheduleMap[enrollment.class_id] || [];
        const upcomingSchedules = schedules.filter(s => s.date >= new Date().toISOString().split('T')[0]).sort((a, b) => a.date.localeCompare(b.date));
        const nextSchedule = upcomingSchedules[0] || null;

        return {
          id: enrollment.course_id,
          classId: enrollment.class_id,
          enrollmentId: enrollment.id,
          name: course?.name || '课程',
          subject: course?.subject || '',
          teacherName: teacher?.name || '',
          teacherPhone: teacher?.phone || '',
          className: classInfo?.name || '',
          room: classInfo?.room || '',
          schedule: classInfo?.schedule || '',
          studentCount: studentCount,
          capacity: classInfo?.capacity || 0,
          nextSchedule: nextSchedule ? {
            date: nextSchedule.date,
            time: `${nextSchedule.start_time}-${nextSchedule.end_time}`,
            weekDay: nextSchedule.week_day
          } : null
        };
      });

      this.setData({
        currentStudent,
        courses,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  viewCourse(e) {
    const classId = e.currentTarget.dataset.classid;
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${classId}`
    });
  }
});
