/**
 * Mock 方法 - 积分 + 分享 + 礼品 + 兑换 + 成长报告 + 推荐 + 机构 + 试听 + 评价 + 教师统计
 */
const { MATERIAL_CATEGORIES, PORTFOLIO_CATEGORIES } = require('./mock-data');

module.exports = {
  // ==================== 成长报告方法 ====================
  getLatestGrowthReport(params) {
    const studentId = params.student_id;
    const period = params.period || 'weekly';
    return this.growth_reports.find(r => r.student_id === studentId && r.period === period) || null;
  },

  generateGrowthReport(params) {
    const student = this.students.find(s => s.id === params.student_id);
    if (!student) return null;

    const attendances = this.attendances.filter(a => a.student_id === params.student_id);
    const grades = this.grades.filter(g => g.student_id === params.student_id);
    const portfolioItems = this.student_portfolios.filter(p => p.student_id === params.student_id && p.status === 'active');

    const report = {
      id: 'gr' + String(this.growth_reports.length + 1).padStart(3, '0'),
      student_id: params.student_id,
      class_id: params.class_id,
      period: params.period || 'weekly',
      date_range: params.date_range || '2026-05-26 ~ 2026-06-01',
      attendance_rate: 95,
      attendance_count: 3,
      attendance_total: 3,
      attendance_trend: 5,
      homework_rate: 90,
      homework_trend: 3,
      score_avg: grades.length > 0 ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : 0,
      score_trend: 5,
      excellent_count: portfolioItems.filter(p => p.is_excellent).length,
      overall_level: '良好',
      encouragement: '继续保持，进步看得见！',
      teacher_comment: '',
      teacher_name: '',
      score_history: [],
      portfolio_items: portfolioItems.slice(0, 3).map(p => ({
        id: p.id, title: p.title, thumbnail: p.thumbnail, date: p.work_date
      })),
      created_at: new Date().toISOString()
    };

    this.growth_reports.push(report);
    return report;
  },

  // ==================== 推荐方法 ====================
  getReferralsByParent(parentId) {
    return this.referrals.filter(r => r.referrer_parent_id === parentId);
  },

  getReferralStats(parentId) {
    const myReferrals = parentId ? this.referrals.filter(r => r.referrer_parent_id === parentId) : this.referrals;
    return {
      total: myReferrals.length,
      trial: myReferrals.filter(r => r.status === 'trial').length,
      enrolled: myReferrals.filter(r => r.status === 'enrolled').length,
      rewards: myReferrals.filter(r => r.reward_claimed).length
    };
  },

  addReferral(params) {
    const referral = {
      id: 'ref' + String(this.referrals.length + 1).padStart(3, '0'),
      referrer_parent_id: params.referrer_parent_id,
      invitee_phone: params.invitee_phone || '',
      invitee_name: params.invitee_name || '微信好友',
      status: 'pending',
      reward_claimed: false,
      created_at: new Date().toISOString()
    };
    this.referrals.push(referral);
    return referral;
  },

  claimReferralReward(referralId) {
    const referral = this.referrals.find(r => r.id === referralId);
    if (!referral) return null;
    referral.reward_claimed = true;
    return referral;
  },

  // ==================== 机构品牌方法 ====================
  getSchoolProfile() {
    return this.school_profile;
  },

  updateSchoolProfile(params) {
    Object.assign(this.school_profile, params, { updated_at: new Date().toISOString() });
    return this.school_profile;
  },

  // ==================== 试听报告方法 ====================
  getTrialReportById(id) {
    return this.trial_reports.find(r => r.id === id) || null;
  },

  addTrialReport(params) {
    const report = {
      id: 'tr' + String(this.trial_reports.length + 1).padStart(3, '0'),
      ...params,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    this.trial_reports.push(report);
    return report;
  },

  confirmTrialReport(id) {
    const report = this.trial_reports.find(r => r.id === id);
    if (!report) return null;
    report.status = 'confirmed';
    return report;
  },

  // ==================== 家长评价方法 ====================
  getReviews(params) {
    const limit = params && params.limit ? params.limit : 10;
    return this.reviews.slice(0, limit);
  },

  getFeaturedPortfolios(params) {
    const limit = params && params.limit ? params.limit : 6;
    return this.student_portfolios
      .filter(p => p.status === 'active' && (p.is_featured || p.is_excellent))
      .slice(0, limit)
      .map(p => {
        const student = this.students.find(s => s.id === p.student_id);
        const teacher = this.teachers.find(t => t.id === p.teacher_id);
        return {
          ...p,
          student_name: student ? student.name : '学员',
          teacher_name: teacher ? teacher.name : '老师'
        };
      });
  },

  getStudentPortfolioSummary(studentId) {
    const items = this.student_portfolios.filter(i => i.student_id === studentId && i.status === 'active');
    return {
      total_count: items.length,
      featured_count: items.filter(i => i.is_featured).length,
      excellent_count: items.filter(i => i.is_excellent).length,
      latest_items: items.sort((a, b) => new Date(b.work_date) - new Date(a.work_date)).slice(0, 3)
    };
  },

  // ==================== 教师端统计方法 ====================
  getTeacherStats(teacherId) {
    const classes = this.getTeacherClasses(teacherId);
    const classIds = classes.map(c => c.id);
    const schedules = this.schedules.filter(s => classIds.includes(s.class_id));
    const students = this.getTeacherStudents(teacherId);

    const now = new Date();
    const monthSchedules = schedules.filter(s => {
      const date = new Date(s.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const monthHours = monthSchedules.reduce((sum, s) => sum + s.duration, 0);

    const monthNewStudents = students.filter(s => {
      const created = new Date(s.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    const attendances = this.getTeacherAttendances(teacherId);
    const presentCount = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100 * 10) / 10 : 0;

    return {
      class_count: classes.length,
      student_count: students.length,
      month_hours: monthHours,
      month_new_students: monthNewStudents,
      attendance_rate: attendanceRate,
      assignment_count: this.getTeacherAssignments(teacherId).length
    };
  },

  // ==================== 积分方法 ====================
  getGiftPoints(parentId) {
    let record = this._gift_points.find(gp => gp.parent_id === parentId);
    if (!record) {
      record = {
        id: 'gp' + String(this._gift_points.length + 1).padStart(3, '0'),
        parent_id: parentId,
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this._gift_points.push(record);
    }
    return record;
  },

  addPoints(parentId, amount, type, shareId, description) {
    let record = this._gift_points.find(gp => gp.parent_id === parentId);
    if (!record) {
      record = {
        id: 'gp' + String(this._gift_points.length + 1).padStart(3, '0'),
        parent_id: parentId, balance: 0, total_earned: 0, total_spent: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      this._gift_points.push(record);
    }
    record.balance += amount;
    record.total_earned += amount;
    record.updated_at = new Date().toISOString();
    const pointRecord = {
      id: 'pr' + String(this._point_records.length + 1).padStart(3, '0'),
      parent_id: parentId, type, amount, share_id: shareId || null,
      description, created_at: new Date().toISOString()
    };
    this._point_records.push(pointRecord);
    return { balance: record.balance, record: pointRecord };
  },

  deductPoints(parentId, amount, description) {
    let record = this._gift_points.find(gp => gp.parent_id === parentId);
    if (!record || record.balance < amount) return null;
    record.balance -= amount;
    record.total_spent += amount;
    record.updated_at = new Date().toISOString();
    const pointRecord = {
      id: 'pr' + String(this._point_records.length + 1).padStart(3, '0'),
      parent_id: parentId, type: 'exchange_deduct', amount: -amount,
      share_id: null, description, created_at: new Date().toISOString()
    };
    this._point_records.push(pointRecord);
    return { balance: record.balance, record: pointRecord };
  },

  refundPoints(parentId, amount, description) {
    let record = this._gift_points.find(gp => gp.parent_id === parentId);
    if (!record) return null;
    record.balance += amount;
    record.total_spent -= amount;
    record.updated_at = new Date().toISOString();
    const pointRecord = {
      id: 'pr' + String(this._point_records.length + 1).padStart(3, '0'),
      parent_id: parentId, type: 'exchange_refund', amount,
      share_id: null, description, created_at: new Date().toISOString()
    };
    this._point_records.push(pointRecord);
    return { balance: record.balance, record: pointRecord };
  },

  getPointRecords(parentId, filters) {
    let records = this._point_records.filter(r => r.parent_id === parentId);
    if (filters && filters.type) {
      records = records.filter(r => r.type === filters.type);
    }
    return records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // ==================== 分享记录方法 ====================
  getShareRecord(parentId, pageType, pagePath) {
    return this._share_records.find(r =>
      r.parent_id === parentId && r.page_type === pageType && r.page_path === pagePath
    ) || null;
  },

  createShareRecord(parentId, pageType, pagePath) {
    const shareId = 'SH_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4).toUpperCase();
    const record = {
      id: 'shr' + String(this._share_records.length + 1).padStart(3, '0'),
      share_id: shareId, parent_id: parentId, page_type: pageType,
      page_path: pagePath, visitor_openid: null, visited: false,
      points_awarded: false, created_at: new Date().toISOString(), visited_at: null
    };
    this._share_records.push(record);
    return record;
  },

  visitShareRecord(shareId, visitorOpenid) {
    const record = this._share_records.find(r => r.share_id === shareId);
    if (!record) return { success: false, message: '分享记录不存在' };
    if (record.visited) return { success: false, message: '已被访问过' };
    const sharerParent = this.parents.find(p => p.id === record.parent_id);
    const sharerUser = sharerParent ? this.users.find(u => u.id === sharerParent.user_id) : null;
    if (sharerUser && visitorOpenid === sharerUser.id) {
      return { success: false, message: '不能访问自己的分享' };
    }
    record.visited = true;
    record.visitor_openid = visitorOpenid;
    record.visited_at = new Date().toISOString();
    if (!record.points_awarded) {
      record.points_awarded = true;
      const pageName = record.page_type === 'growth_report' ? '成长报告' : '机构主页';
      this.addPoints(record.parent_id, 10, 'share_reward', shareId, '分享' + pageName + '获得积分');
    }
    return { success: true, points_awarded: true };
  },

  // ==================== 礼品方法 ====================
  getGifts(filters) {
    let list = [...this._gifts];
    if (filters && filters.status) {
      list = list.filter(g => g.status === filters.status);
    }
    if (filters && filters.keyword) {
      list = list.filter(g => g.name.includes(filters.keyword));
    }
    return list;
  },

  getGiftById(id) {
    return this._gifts.find(g => g.id === id) || null;
  },

  addGift(data) {
    const gift = {
      id: 'g' + String(this._gifts.length + 1).padStart(3, '0'),
      name: data.name, description: data.description || '', image: data.image || '',
      stock: parseInt(data.stock) || 0, required_points: parseInt(data.required_points) || 0,
      status: data.status || 'off_shelf', created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this._gifts.push(gift);
    return gift;
  },

  updateGift(id, data) {
    const gift = this._gifts.find(g => g.id === id);
    if (!gift) return null;
    Object.assign(gift, data, { updated_at: new Date().toISOString() });
    return gift;
  },

  deleteGift(id) {
    const idx = this._gifts.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this._gifts.splice(idx, 1);
    return { success: true };
  },

  // ==================== 兑换订单方法 ====================
  getExchangeOrders(filters) {
    let list = [...this._exchange_orders];
    if (filters && filters.status) {
      list = list.filter(o => o.status === filters.status);
    }
    if (filters && filters.parent_id) {
      list = list.filter(o => o.parent_id === filters.parent_id);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  createExchangeOrder(parentId, giftId, addressInfo) {
    const gift = this._gifts.find(g => g.id === giftId);
    if (!gift) return null;
    if (gift.status !== 'on_shelf') return null;
    if (gift.stock <= 0) return null;
    const pointsInfo = this._gift_points.find(gp => gp.parent_id === parentId);
    if (!pointsInfo || pointsInfo.balance < gift.required_points) return null;
    this.deductPoints(parentId, gift.required_points, '兑换礼品: ' + gift.name);
    gift.stock -= 1;
    gift.updated_at = new Date().toISOString();
    const order = {
      id: 'eo' + String(this._exchange_orders.length + 1).padStart(3, '0'),
      gift_id: giftId, parent_id: parentId, gift_name: gift.name,
      gift_image: gift.image, points_cost: gift.required_points,
      status: 'pending', address_info: addressInfo,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    this._exchange_orders.push(order);
    return order;
  },

  updateExchangeOrderStatus(id, newStatus) {
    const order = this._exchange_orders.find(o => o.id === id);
    if (!order) return null;
    if (newStatus === 'cancelled' && order.status !== 'cancelled') {
      this.refundPoints(order.parent_id, order.points_cost, '兑换取消退还: ' + order.gift_name);
      const gift = this._gifts.find(g => g.id === order.gift_id);
      if (gift) {
        gift.stock += 1;
        gift.updated_at = new Date().toISOString();
      }
    }
    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    return order;
  }
};
