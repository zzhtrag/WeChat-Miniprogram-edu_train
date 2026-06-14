const config = require('../config.js');
const mockData = require('../data/mock.js');

// ==================== Mock 路由表 ====================
// 格式: 'METHOD /path/:param' => handler(params, data, pathVars)
const mockRoutes = {
  // ---- 认证 ----
  'POST /auth/send-code': (params) => ({ success: true }),
  'POST /auth/login': (params) => mockData.validateLogin(params.phone, params.password),
  'POST /auth/code-login': (params) => mockData.validateLogin(params.phone, '1234'),
  'POST /auth/wx-phone-login': (params) => mockData.validateLogin('111', '1234'),

  // ---- 用户 ----
  'GET /users': () => mockData.users,
  'GET /users/:id': (params, data, pv) => mockData.getUserById(pv.id),
  'PUT /users/:id': (params, data, pv) => mockData.updateUser(pv.id, params),
  'GET /users/phone/:phone': (params, data, pv) => mockData.getUserByPhone(pv.phone),
  'GET /users/phone/:phone/roles': (params, data, pv) => mockData.getUserRolesByPhone(pv.phone),

  // ---- 教师 ----
  'GET /teachers': (params) => {
    if (params && Object.keys(params).length) return mockData.getTeachers(params);
    return mockData.teachers;
  },
  'GET /teachers/:id': (params, data, pv) => mockData.getTeacherById(pv.id),
  'GET /teachers/user/:userId': (params, data, pv) => mockData.getTeacherByUserId(pv.userId),
  'POST /teachers': (params) => mockData.addTeacher(params),
  'PUT /teachers/:id': (params, data, pv) => mockData.updateTeacher(pv.id, params),
  'DELETE /teachers/:id': (params, data, pv) => mockData.deleteTeacher(pv.id),

  // ---- 学生 ----
  'GET /students': (params) => {
    if (params && Object.keys(params).length) return mockData.getStudents(params);
    return mockData.students;
  },
  'GET /students/:id': (params, data, pv) => mockData.getStudentById(pv.id),
  'POST /students': (params) => mockData.addStudent(params),
  'PUT /students/:id': (params, data, pv) => mockData.updateStudent(pv.id, params),
  'DELETE /students/:id': (params, data, pv) => mockData.deleteStudent(pv.id),
  'PUT /students/:id/status': (params, data, pv) => mockData.updateStudentStatus(pv.id, params.status),

  // ---- 家长 ----
  'GET /parents': (params) => {
    if (params && Object.keys(params).length) return mockData.getParents(params);
    return mockData.parents;
  },
  'GET /parents/:id': (params, data, pv) => mockData.getParentById(pv.id),
  'POST /parents': (params) => mockData.addParent(params),
  'PUT /parents/:id': (params, data, pv) => mockData.updateParent(pv.id, params),
  'GET /parents/:id/students': (params, data, pv) => mockData.getParentStudents(pv.id),

  // ---- 课程 ----
  'GET /courses': (params) => {
    if (params && Object.keys(params).length) return mockData.getCourses(params);
    return mockData.courses;
  },
  'GET /courses/:id': (params, data, pv) => mockData.getCourseById(pv.id),
  'POST /courses': (params) => mockData.addCourse(params),
  'PUT /courses/:id': (params, data, pv) => mockData.updateCourse(pv.id, params),
  'PUT /courses/:id/status': (params, data, pv) => mockData.updateCourseStatus(pv.id, params.status),
  'DELETE /courses/:id': (params, data, pv) => mockData.deleteCourse(pv.id),

  // ---- 班级 ----
  'GET /classes': (params) => {
    if (params && Object.keys(params).length) return mockData.getClasses(params);
    return mockData.classes;
  },
  'GET /classes/:id': (params, data, pv) => mockData.getClassById(pv.id),
  'POST /classes': (params) => mockData.addClass(params),
  'PUT /classes/:id': (params, data, pv) => mockData.updateClass(pv.id, params),
  'DELETE /classes/:id': (params, data, pv) => mockData.deleteClass(pv.id),
  'PUT /classes/:id/status': (params, data, pv) => mockData.updateClassStatus(pv.id, params.status),
  'GET /classes/:id/students': (params, data, pv) => mockData.getClassStudents(pv.id),
  'GET /classes/:id/schedules': (params, data, pv) => mockData.getClassSchedules(pv.id),
  'GET /classes/:id/portfolio-stats': (params, data, pv) => mockData.getClassPortfolioStats(pv.id),

  // ---- 排课 ----
  'GET /schedules': (params) => {
    if (params && Object.keys(params).length) return mockData.getSchedules(params);
    return mockData.schedules;
  },
  'GET /schedules/:id': (params, data, pv) => mockData.getScheduleById(pv.id),
  'POST /schedules': (params) => mockData.addSchedule(params),
  'PUT /schedules/:id': (params, data, pv) => mockData.updateSchedule(pv.id, params),
  'DELETE /schedules/:id': (params, data, pv) => mockData.deleteSchedule(pv.id),

  // ---- 考勤 ----
  'GET /attendances': (params) => {
    if (params && Object.keys(params).length) return mockData.getAttendances(params);
    return mockData.attendances;
  },
  'POST /attendances': (params) => mockData.addAttendance(params),

  // ---- 成绩 ----
  'GET /grades': (params) => {
    if (params && Object.keys(params).length) return mockData.getGrades(params);
    return mockData.grades;
  },
  'POST /grades': (params) => mockData.addGrade(params),

  // ---- 作业 ----
  'GET /assignments': (params) => {
    if (params && Object.keys(params).length) return mockData.getAssignments(params);
    return mockData.assignments;
  },
  'GET /assignments/:id': (params, data, pv) => mockData.getAssignmentById(pv.id),
  'POST /assignments': (params) => mockData.addAssignment(params),

  // ---- 作业提交 ----
  'GET /submissions': () => mockData.submissions,
  'POST /submissions': (params) => mockData.submitHomework(params),
  'PUT /submissions/:id/grade': (params, data, pv) => mockData.gradeHomework(pv.id, params),
  'GET /students/:id/homework': (params, data, pv) => mockData.getStudentHomework(pv.id),

  // ---- 公告 ----
  'GET /announcements': (params) => {
    if (params && Object.keys(params).length) return mockData.getAnnouncements(params);
    return mockData.announcements;
  },
  'GET /announcements/:id': (params, data, pv) => mockData.getAnnouncementById(pv.id),
  'POST /announcements': (params) => mockData.addAnnouncement(params),
  'PUT /announcements/:id': (params, data, pv) => mockData.updateAnnouncement(pv.id, params),
  'PUT /announcements/:id/pin': (params, data, pv) => mockData.toggleAnnouncementPin(pv.id),
  'DELETE /announcements/:id': (params, data, pv) => mockData.deleteAnnouncement(pv.id),

  // ---- 选课/报名 ----
  'GET /enrollments': () => mockData.enrollments,
  'POST /enrollments': (params) => mockData.addEnrollment(params),
  'DELETE /enrollments/:id': (params, data, pv) => mockData.removeEnrollment(pv.id),
  'GET /students/:id/enrollments': (params, data, pv) => mockData.getStudentEnrollments(pv.id),
  'GET /students/:id/classes': (params, data, pv) => mockData.getStudentClasses(pv.id),
  'GET /students/:id/schedules': (params, data, pv) => mockData.getStudentSchedules(pv.id),
  'GET /students/:id/grades': (params, data, pv) => mockData.getStudentGrades(pv.id),
  'GET /students/:id/attendances': (params, data, pv) => mockData.getStudentAttendances(pv.id),
  'GET /students/:id/portfolio-summary': (params, data, pv) => mockData.getStudentPortfolioSummary(pv.id),

  // ---- 教师维度查询 ----
  'GET /teachers/:id/classes': (params, data, pv) => mockData.getTeacherClasses(pv.id),
  'GET /teachers/:id/students': (params, data, pv) => mockData.getTeacherStudents(pv.id),
  'GET /teachers/:id/schedules': (params, data, pv) => mockData.getTeacherSchedules(pv.id),
  'GET /teachers/:id/attendances': (params, data, pv) => mockData.getTeacherAttendances(pv.id),
  'GET /teachers/:id/assignments': (params, data, pv) => mockData.getTeacherAssignments(pv.id),
  'GET /teachers/:id/stats': (params, data, pv) => mockData.getTeacherStats(pv.id),
  'GET /teachers/:id/material-stats': (params, data, pv) => mockData.getTeacherMaterialStats(pv.id),
  'GET /teachers/:id/portfolio-stats': (params, data, pv) => mockData.getTeacherPortfolioStats(pv.id),

  // ---- 教学资料 ----
  'GET /materials': (params) => {
    if (params && Object.keys(params).length) return mockData.getMaterials(params);
    return mockData.teaching_materials;
  },
  'GET /materials/:id': (params, data, pv) => mockData.getMaterialById(pv.id),
  'POST /materials': (params) => mockData.addMaterial(params),
  'PUT /materials/:id': (params, data, pv) => mockData.updateMaterial(pv.id, params),
  'DELETE /materials/:id': (params, data, pv) => mockData.deleteMaterial(pv.id),
  'POST /materials/:id/share/:classId': (params, data, pv) => mockData.shareMaterialToClass(pv.id, pv.classId),
  'DELETE /materials/:id/share/:classId': (params, data, pv) => mockData.unshareMaterialFromClass(pv.id, pv.classId),
  'GET /classes/:id/materials': (params, data, pv) => mockData.getMaterialsSharedWithClass(pv.id),

  // ---- 资料文件夹 ----
  'GET /folders': (params) => mockData.getFolders(params),
  'POST /folders': (params) => mockData.addFolder(params),
  'PUT /folders/:id': (params, data, pv) => mockData.updateFolder(pv.id, params),
  'DELETE /folders/:id': (params, data, pv) => mockData.deleteFolder(pv.id),

  // ---- 学生作品集 ----
  'GET /portfolios': (params) => {
    if (params && Object.keys(params).length) return mockData.getPortfolioItems(params);
    return mockData.student_portfolios;
  },
  'GET /portfolios/:id': (params, data, pv) => mockData.getPortfolioItemById(pv.id),
  'POST /portfolios': (params) => mockData.addPortfolioItem(params),
  'PUT /portfolios/:id': (params, data, pv) => mockData.updatePortfolioItem(pv.id, params),
  'DELETE /portfolios/:id': (params, data, pv) => mockData.deletePortfolioItem(pv.id),
  'POST /portfolios/:id/featured': (params, data, pv) => mockData.togglePortfolioFeatured(pv.id),
  'POST /portfolios/:id/excellent': (params, data, pv) => mockData.togglePortfolioExcellent(pv.id),
  'GET /students/:id/portfolio-timeline': (params, data, pv) => mockData.getStudentPortfolioTimeline(pv.id),

  // ---- 消息 ----
  'GET /messages': (params) => mockData.getTeacherMessages(params),
  'PUT /messages/:id/read': (params, data, pv) => mockData.markMessageRead(pv.id),
  'PUT /messages/read-all': (params) => mockData.markAllMessagesRead(params),

  // ---- 报名 ----
  'GET /registrations': (params) => {
    if (params && Object.keys(params).length) return mockData.getRegistrations(params);
    return mockData.registrations;
  },
  'GET /registrations/stats': () => mockData.getRegistrationStats(),
  'GET /registrations/phone/:phone': (params, data, pv) => mockData.getRegistrationsByPhone(pv.phone),
  'GET /registrations/:id': (params, data, pv) => mockData.getRegistrationById(pv.id),
  'POST /registrations': (params) => mockData.addRegistration(params),
  'PUT /registrations/:id/status': (params, data, pv) => mockData.updateRegistrationStatus(pv.id, params.status),
  'POST /registrations/:id/auto-register': (params, data, pv) => mockData._autoRegisterFromEnrollment(pv.id),

  // ---- 统计 ----
  'GET /stats/admin': () => mockData.getAdminStats(),

  // ---- 班级学员操作 ----
  'DELETE /classes/:classId/students/:studentId': (params, data, pv) => mockData.removeStudentFromClass(pv.classId, pv.studentId),

  // ---- 成长报告 ----
  'GET /growth-reports/latest': (params) => mockData.getLatestGrowthReport(params),
  'POST /growth-reports/generate': (params) => mockData.generateGrowthReport(params),

  // ---- 推荐 ----
  'GET /referrals/mine': (params) => mockData.getReferralsByParent(params.parent_id),
  'GET /referrals/stats': (params) => mockData.getReferralStats(params.parent_id),
  'POST /referrals': (params) => mockData.addReferral(params),
  'POST /referrals/:id/claim': (params, data, pv) => mockData.claimReferralReward(pv.id),

  // ---- 机构品牌 ----
  'GET /school-profile': () => mockData.getSchoolProfile(),
  'PUT /school-profile': (params) => mockData.updateSchoolProfile(params),

  // ---- 试听报告 ----
  'GET /trial-reports/:id': (params, data, pv) => mockData.getTrialReportById(pv.id),
  'POST /trial-reports': (params) => mockData.addTrialReport(params),
  'POST /trial-reports/:id/confirm': (params, data, pv) => mockData.confirmTrialReport(pv.id),

  // ---- 家长评价 ----
  'GET /reviews': (params) => mockData.getReviews(params),

  // ---- 精选作品 ----
  'GET /portfolios/featured': (params) => mockData.getFeaturedPortfolios(params),

  // ---- 积分 ----
  'GET /gift-points': (params) => mockData.getGiftPoints(params.parent_id),
  'GET /gift-points/records': (params) => mockData.getPointRecords(params.parent_id, params),

  // ---- 分享记录 ----
  'GET /share-records': (params) => mockData.getShareRecord(params.parent_id, params.page_type, params.page_path),
  'POST /share-records': (params) => mockData.createShareRecord(params.parent_id, params.page_type, params.page_path),
  'POST /share-records/visit': (params) => mockData.visitShareRecord(params.share_id, params.visitor_openid),

  // ---- 礼品 ----
  'GET /gifts': (params) => {
    if (params && Object.keys(params).length) return mockData.getGifts(params);
    return mockData._gifts;
  },
  'GET /gifts/:id': (params, data, pv) => mockData.getGiftById(pv.id),
  'POST /gifts': (params) => mockData.addGift(params),
  'PUT /gifts/:id': (params, data, pv) => mockData.updateGift(pv.id, params),
  'DELETE /gifts/:id': (params, data, pv) => mockData.deleteGift(pv.id),

  // ---- 兑换订单 ----
  'GET /exchange-orders': (params) => {
    if (params && Object.keys(params).length) return mockData.getExchangeOrders(params);
    return mockData._exchange_orders;
  },
  'POST /exchange-orders': (params) => mockData.createExchangeOrder(params.parent_id, params.gift_id, params.address_info),
  'PUT /exchange-orders/:id/status': (params, data, pv) => mockData.updateExchangeOrderStatus(pv.id, params.status)
};

// ==================== URL 匹配 ====================

function matchMockRoute(method, url) {
  const pattern = method + ' ' + url;

  for (const routeKey of Object.keys(mockRoutes)) {
    const routeParts = routeKey.split(' ');
    const routeMethod = routeParts[0];
    const routePath = routeParts.slice(1).join(' ');

    if (routeMethod !== method) continue;

    const patternSegments = routePath.split('/');
    const urlSegments = url.split('/');

    if (patternSegments.length !== urlSegments.length) continue;

    let match = true;
    const pathVars = {};

    for (let i = 0; i < patternSegments.length; i++) {
      if (patternSegments[i].startsWith(':')) {
        pathVars[patternSegments[i].substring(1)] = urlSegments[i];
      } else if (patternSegments[i] !== urlSegments[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return { handler: mockRoutes[routeKey], pathVars };
    }
  }

  return null;
}

// ==================== 请求核心 ====================

function request(url, method = 'GET', data = {}) {
  // Mock 模式
  if (config.useMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matched = matchMockRoute(method, url);
        if (matched) {
          try {
            const result = matched.handler(data, data, matched.pathVars);
            if (result) {
              resolve(result);
            } else {
              reject({ code: -1, message: '数据不存在' });
            }
          } catch (err) {
            reject({ code: -1, message: err.message || 'Mock处理异常' });
          }
        } else {
          reject({ code: -1, message: 'Mock路由未找到: ' + method + ' ' + url });
        }
      }, 100);
    });
  }

  // 真实 API 模式
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.apiBase + config.apiPrefix + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': getApp().globalData.token ? 'Bearer ' + getApp().globalData.token : ''
      },
      timeout: config.timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            const result = res.data.data;
            // 后端列表接口返回 { items: [...], total, page, ... } 分页格式，自动解包为数组
            if (result && typeof result === 'object' && Array.isArray(result.items)) {
              resolve(result.items);
            } else {
              resolve(result);
            }
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

module.exports = {
  get: (url, data) => request(url, 'GET', data),
  post: (url, data) => request(url, 'POST', data),
  put: (url, data) => request(url, 'PUT', data),
  delete: (url, data) => request(url, 'DELETE', data)
};
