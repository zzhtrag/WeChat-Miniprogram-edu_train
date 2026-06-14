/**
 * 培训中心管理系统 - Mock 数据层（数据表）
 */

// ==================== 分类常量 ====================
const MATERIAL_CATEGORIES = {
  courseware: '课件',
  lesson_plan: '教案',
  exercise: '习题',
  reference: '参考资料',
  other: '其他'
};

const PORTFOLIO_CATEGORIES = {
  artwork: '艺术作品',
  essay: '作文',
  exam_paper: '试卷',
  homework: '作业',
  competition: '竞赛作品',
  other: '其他'
};

const mockData = {
  // ==================== 礼品积分账户 ====================
  _gift_points: [
    {
      id: 'gp001',
      parent_id: 'p001',
      balance: 50,
      total_earned: 70,
      total_spent: 20,
      created_at: '2026-04-01',
      updated_at: '2026-05-28'
    },
    {
      id: 'gp002',
      parent_id: 'p002',
      balance: 20,
      total_earned: 30,
      total_spent: 10,
      created_at: '2026-04-10',
      updated_at: '2026-05-20'
    }
  ],

  // ==================== 积分流水 ====================
  _point_records: [
    {
      id: 'pr001',
      parent_id: 'p001',
      type: 'share_reward',
      amount: 10,
      share_id: 'SH_a1b2c3',
      description: '分享成长报告获得积分',
      created_at: '2026-05-01 10:00:00'
    },
    {
      id: 'pr002',
      parent_id: 'p001',
      type: 'exchange_refund',
      amount: 20,
      share_id: null,
      description: '兑换取消退还积分',
      created_at: '2026-05-10 14:00:00'
    }
  ],

  // ==================== 分享记录 ====================
  _share_records: [
    {
      id: 'shr001',
      share_id: 'SH_a1b2c3',
      parent_id: 'p001',
      page_type: 'growth_report',
      page_path: '/pages/growth-report/growth-report?period=weekly',
      visitor_openid: 'visitor_002',
      visited: true,
      points_awarded: true,
      created_at: '2026-05-01 09:00:00',
      visited_at: '2026-05-01 09:30:00'
    }
  ],

  // ==================== 礼品 ====================
  _gifts: [
    {
      id: 'g001',
      name: '定制文具套装',
      description: '精美定制文具套装，含笔记本、签字笔、书签',
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop',
      stock: 50,
      required_points: 100,
      status: 'on_shelf',
      created_at: '2026-04-01',
      updated_at: '2026-05-15'
    },
    {
      id: 'g002',
      name: '课时抵用券',
      description: '可抵扣1节常规课程费用',
      image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop',
      stock: 30,
      required_points: 200,
      status: 'on_shelf',
      created_at: '2026-04-01',
      updated_at: '2026-05-15'
    },
    {
      id: 'g003',
      name: '编程体验课',
      description: '少儿编程1对1体验课一节',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
      stock: 10,
      required_points: 300,
      status: 'on_shelf',
      created_at: '2026-04-15',
      updated_at: '2026-05-10'
    },
    {
      id: 'g004',
      name: '限量版书包',
      description: '机构联名限量版双肩背包',
      image: '',
      stock: 0,
      required_points: 500,
      status: 'off_shelf',
      created_at: '2026-03-01',
      updated_at: '2026-04-01'
    }
  ],

  // ==================== 兑换订单 ====================
  _exchange_orders: [
    {
      id: 'eo001',
      gift_id: 'g001',
      parent_id: 'p001',
      gift_name: '定制文具套装',
      gift_image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop',
      points_cost: 100,
      status: 'completed',
      address_info: { name: '刘女士', phone: '13712340001', address: '北京市朝阳区xxx小区' },
      created_at: '2026-05-10 14:00:00',
      updated_at: '2026-05-12 10:00:00'
    }
  ],

  // ==================== 用户表（登录账号） ====================
  users: [
    {
      id: 'admin001',
      phone: '111',
      password: '1234',
      role: 'admin',
      name: '张校长',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-01-01'
    },
    {
      id: 'teacher001',
      phone: '222',
      password: '1234',
      role: 'teacher',
      name: '王老师',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-01-01'
    },
    {
      id: 'teacher002',
      phone: '444',
      password: '1234',
      role: 'teacher',
      name: '李老师',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-01-15'
    },
    {
      id: 'parent001',
      phone: '333',
      password: '1234',
      role: 'parent',
      name: '刘女士',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-02-01'
    },
    {
      id: 'teacher003',
      phone: '555',
      password: '1234',
      role: 'teacher',
      name: '张老师',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-01-15'
    },
    {
      id: 'teacher004',
      phone: '666',
      password: '1234',
      role: 'teacher',
      name: '赵老师',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-01-20'
    },
    {
      id: 'teacher005',
      phone: '777',
      password: '1234',
      role: 'teacher',
      name: '陈老师',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      status: 'inactive',
      created_at: '2024-02-01'
    },
    {
      id: 'parent002',
      phone: '888',
      password: '1234',
      role: 'parent',
      name: '赵先生',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-01-20'
    },
    {
      id: 'parent003',
      phone: '999',
      password: '1234',
      role: 'parent',
      name: '李女士',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-03-01'
    },
    {
      id: 'parent004',
      phone: '000',
      password: '1234',
      role: 'parent',
      name: '王先生',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      status: 'active',
      created_at: '2024-02-15'
    }
  ],

  // ==================== 教师表 ====================
  teachers: [
    {
      id: 't001',
      user_id: 'teacher001',
      employee_no: 'T2024001',
      name: '王老师',
      phone: '13900110001',
      email: 'wang@school.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      subjects: ['数学', '物理'],
      grade: '高中部',
      education: '硕士',
      school: '北京师范大学',
      entry_date: '2020-09-01',
      status: 'active',
      created_at: '2020-09-01'
    },
    {
      id: 't002',
      user_id: 'teacher002',
      employee_no: 'T2024002',
      name: '李老师',
      phone: '13900110002',
      email: 'li@school.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      subjects: ['英语'],
      grade: '高中部',
      education: '本科',
      school: '北京外国语大学',
      entry_date: '2021-03-15',
      status: 'active',
      created_at: '2021-03-15'
    },
    {
      id: 't003',
      user_id: 'teacher003',
      employee_no: 'T2024003',
      name: '张老师',
      phone: '13900110003',
      email: 'zhang@school.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      subjects: ['语文'],
      grade: '初中部',
      education: '硕士',
      school: '华东师范大学',
      entry_date: '2019-07-10',
      status: 'active',
      created_at: '2019-07-10'
    },
    {
      id: 't004',
      user_id: 'teacher004',
      employee_no: 'T2024004',
      name: '赵老师',
      phone: '13900110004',
      email: 'zhao@school.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      subjects: ['化学', '生物'],
      grade: '高中部',
      education: '博士',
      school: '清华大学',
      entry_date: '2022-02-20',
      status: 'active',
      created_at: '2022-02-20'
    },
    {
      id: 't005',
      user_id: 'teacher005',
      employee_no: 'T2024005',
      name: '陈老师',
      phone: '13900110005',
      email: 'chen@school.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      subjects: ['历史', '政治'],
      grade: '初中部',
      education: '本科',
      school: '北京大学',
      entry_date: '2021-09-01',
      status: 'inactive',
      created_at: '2021-09-01'
    }
  ],

  // ==================== 学生表 ====================
  students: [
    {
      id: 's001',
      student_no: 'S2024001',
      name: '张小明',
      gender: 'male',
      birthday: '2008-05-15',
      grade: '高三',
      parent_id: 'p001',
      address: '北京市朝阳区xxx小区',
      tags: ['活跃', '需关注'],
      remarks: '数学基础较好，英语需要加强',
      status: 'active',
      enrolled_date: '2024-01-15',
      created_at: '2024-01-15'
    },
    {
      id: 's002',
      student_no: 'S2024002',
      name: '张小红',
      gender: 'female',
      birthday: '2009-08-20',
      grade: '高一',
      parent_id: 'p001',
      address: '北京市朝阳区xxx小区',
      tags: ['进步明显'],
      remarks: '',
      status: 'active',
      enrolled_date: '2024-02-20',
      created_at: '2024-02-20'
    },
    {
      id: 's003',
      student_no: 'S2024003',
      name: '赵小刚',
      gender: 'male',
      birthday: '2008-03-10',
      grade: '高二',
      parent_id: 'p002',
      address: '北京市海淀区xxx小区',
      tags: [],
      remarks: '',
      status: 'active',
      enrolled_date: '2024-01-20',
      created_at: '2024-01-20'
    },
    {
      id: 's004',
      student_no: 'S2024004',
      name: '李雨涵',
      gender: 'female',
      birthday: '2009-11-25',
      grade: '高一',
      parent_id: 'p003',
      address: '北京市东城区xxx小区',
      tags: ['优秀学生'],
      remarks: '各科成绩优异',
      status: 'active',
      enrolled_date: '2024-03-01',
      created_at: '2024-03-01'
    },
    {
      id: 's005',
      student_no: 'S2024005',
      name: '王子豪',
      gender: 'male',
      birthday: '2010-02-14',
      grade: '初三',
      parent_id: 'p004',
      address: '北京市西城区xxx小区',
      tags: [],
      remarks: '',
      status: 'active',
      enrolled_date: '2024-02-15',
      created_at: '2024-02-15'
    },
    {
      id: 's006',
      student_no: 'S2024006',
      name: '刘晓宇',
      gender: 'male',
      birthday: '2012-07-08',
      grade: '初一',
      parent_id: 'p001',
      address: '北京市朝阳区xxx小区',
      tags: ['新学员'],
      remarks: '刚入学，需关注适应情况',
      status: 'active',
      enrolled_date: '2024-06-01',
      created_at: '2024-06-01'
    }
  ],

  // ==================== 家长表 ====================
  parents: [
    {
      id: 'p001',
      user_id: 'parent001',
      name: '刘女士',
      phone: '13712340001',
      relation: '母亲',
      referral_code: 'XCE3F2',
      status: 'active',
      created_at: '2024-02-01'
    },
    {
      id: 'p002',
      user_id: 'parent002',
      name: '赵先生',
      phone: '13712340002',
      relation: '父亲',
      referral_code: 'RK7N4A',
      status: 'active',
      created_at: '2024-01-20'
    },
    {
      id: 'p003',
      user_id: 'parent003',
      name: '李女士',
      phone: '13712340003',
      relation: '母亲',
      referral_code: 'LM9P5B',
      status: 'active',
      created_at: '2024-03-01'
    },
    {
      id: 'p004',
      user_id: 'parent004',
      name: '王先生',
      phone: '13712340004',
      relation: '父亲',
      referral_code: 'WQ2H8C',
      status: 'active',
      created_at: '2024-02-15'
    }
  ],

  // ==================== 课程表 ====================
  courses: [
    {
      id: 'c001',
      name: '数学冲刺班',
      subject: '数学',
      description: '本课程针对高三数学重点难点进行全面突破',
      textbook: '人教版高三数学',
      capacity: 30,
      is_open: true,
      status: 'active',
      created_at: '2024-01-01'
    },
    {
      id: 'c002',
      name: '英语强化班',
      subject: '英语',
      description: '从词汇、语法、听力、阅读、写作全方位提升英语能力',
      textbook: '外研版高一英语',
      capacity: 25,
      is_open: true,
      status: 'active',
      created_at: '2024-01-01'
    },
    {
      id: 'c003',
      name: '物理提高班',
      subject: '物理',
      description: '系统讲解高中物理力学、电磁学等重点内容',
      textbook: '人教版高二物理',
      capacity: 20,
      is_open: true,
      status: 'active',
      created_at: '2024-01-01'
    },
    {
      id: 'c004',
      name: '语文精品班',
      subject: '语文',
      description: '提升阅读理解、写作能力和文学素养',
      textbook: '部编版语文',
      capacity: 30,
      is_open: true,
      status: 'active',
      created_at: '2024-01-15'
    },
    {
      id: 'c005',
      name: '化学基础班',
      subject: '化学',
      description: '化学基础知识讲解和实验操作',
      textbook: '人教版化学',
      capacity: 25,
      is_open: true,
      status: 'active',
      created_at: '2024-02-01'
    },
    {
      id: 'c006',
      name: '数学思维训练',
      subject: '数学',
      description: '培养数学思维和解题技巧',
      textbook: '自编教材',
      capacity: 25,
      is_open: true,
      status: 'active',
      created_at: '2024-06-01'
    },
    {
      id: 'c007',
      name: '物理竞赛辅导',
      subject: '物理',
      description: '物理竞赛专题训练',
      textbook: '竞赛辅导教材',
      capacity: 20,
      is_open: true,
      status: 'active',
      created_at: '2024-06-01'
    },
    {
      id: 'c008',
      name: '高中数学复习班',
      subject: '数学',
      description: '高考数学全面复习',
      textbook: '高考复习资料',
      capacity: 30,
      is_open: true,
      status: 'active',
      created_at: '2024-06-01'
    }
  ],

  // ==================== 班级表 ====================
  classes: [
    {
      id: 'cl001',
      name: '高三数学1班',
      course_id: 'c001',
      teacher_id: 't001',
      assistant_id: null,
      room: 'A101教室',
      capacity: 30,
      start_date: '2024-03-01',
      end_date: '2024-06-30',
      schedule: '周一、周三 09:00-11:00',
      remarks: '',
      status: 'active',
      created_at: '2024-02-15'
    },
    {
      id: 'cl002',
      name: '高一英语1班',
      course_id: 'c002',
      teacher_id: 't002',
      assistant_id: null,
      room: 'B203教室',
      capacity: 25,
      start_date: '2024-03-01',
      end_date: '2024-06-30',
      schedule: '周二、周四 14:00-16:00',
      remarks: '',
      status: 'active',
      created_at: '2024-02-15'
    },
    {
      id: 'cl003',
      name: '高二物理班',
      course_id: 'c003',
      teacher_id: 't001',
      assistant_id: null,
      room: 'A102教室',
      capacity: 20,
      start_date: '2024-03-01',
      end_date: '2024-06-30',
      schedule: '周五 09:00-12:00',
      remarks: '',
      status: 'active',
      created_at: '2024-02-20'
    },
    {
      id: 'cl004',
      name: '初三语文班',
      course_id: 'c004',
      teacher_id: 't003',
      assistant_id: null,
      room: 'C301教室',
      capacity: 30,
      start_date: '2024-03-01',
      end_date: '2024-06-30',
      schedule: '周六 09:00-12:00',
      remarks: '',
      status: 'active',
      created_at: '2024-02-25'
    },
    {
      id: 'cl005',
      name: '高二化学班',
      course_id: 'c005',
      teacher_id: 't004',
      assistant_id: null,
      room: 'D102教室',
      capacity: 25,
      start_date: '2024-03-01',
      end_date: '2024-06-30',
      schedule: '周日 14:00-17:00',
      remarks: '',
      status: 'active',
      created_at: '2024-03-01'
    },
    {
      id: 'cl006',
      name: '高一数学班',
      course_id: 'c006',
      teacher_id: 't001',
      assistant_id: null,
      room: 'A103教室',
      capacity: 25,
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      schedule: '周一、周三 14:00-16:00',
      remarks: '',
      status: 'active',
      created_at: '2024-06-01'
    },
    {
      id: 'cl007',
      name: '高三物理竞赛',
      course_id: 'c007',
      teacher_id: 't001',
      assistant_id: null,
      room: 'A102教室',
      capacity: 20,
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      schedule: '周二、周四 09:00-11:00',
      remarks: '',
      status: 'active',
      created_at: '2024-06-01'
    },
    {
      id: 'cl008',
      name: '高三数学复习班',
      course_id: 'c008',
      teacher_id: 't001',
      assistant_id: null,
      room: 'A101教室',
      capacity: 30,
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      schedule: '周六、周日 09:00-11:00',
      remarks: '',
      status: 'active',
      created_at: '2024-06-01'
    }
  ],

  // ==================== 选课表（学生-班级关系） ====================
  enrollments: [
    { id: 'e001', student_id: 's001', class_id: 'cl001', course_id: 'c001', status: 'active', enroll_time: '2024-02-20 10:00:00', approve_time: '2024-02-20 11:00:00' },
    { id: 'e002', student_id: 's002', class_id: 'cl002', course_id: 'c002', status: 'active', enroll_time: '2024-02-25 14:00:00', approve_time: '2024-02-25 15:00:00' },
    { id: 'e003', student_id: 's003', class_id: 'cl003', course_id: 'c003', status: 'active', enroll_time: '2024-03-01 09:00:00', approve_time: '2024-03-01 10:00:00' },
    { id: 'e004', student_id: 's004', class_id: 'cl002', course_id: 'c002', status: 'active', enroll_time: '2024-03-05 16:00:00', approve_time: '2024-03-05 17:00:00' },
    { id: 'e005', student_id: 's005', class_id: 'cl004', course_id: 'c004', status: 'active', enroll_time: '2024-03-10 11:00:00', approve_time: '2024-03-10 12:00:00' }
  ],

  // ==================== 排课表 ====================
  _getTeacherWangWeekSchedule() {
    const today = new Date();
    const schedules = [];

    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const weekSchedule = [
      [
        { class_id: 'cl008', course_id: 'c008', room: 'A101教室', start_time: '09:00', end_time: '11:00' },
        { class_id: 'cl006', course_id: 'c006', room: 'A103教室', start_time: '14:00', end_time: '16:00' }
      ],
      [
        { class_id: 'cl007', course_id: 'c007', room: 'A102教室', start_time: '09:00', end_time: '11:00' },
        { class_id: 'cl007', course_id: 'c007', room: 'A102教室', start_time: '14:00', end_time: '16:00' }
      ],
      [
        { class_id: 'cl001', course_id: 'c001', room: 'A101教室', start_time: '09:00', end_time: '11:00' },
        { class_id: 'cl006', course_id: 'c006', room: 'A103教室', start_time: '14:00', end_time: '16:00' }
      ],
      [
        { class_id: 'cl007', course_id: 'c007', room: 'A102教室', start_time: '09:00', end_time: '11:00' },
        { class_id: 'cl007', course_id: 'c007', room: 'A102教室', start_time: '14:00', end_time: '16:00' }
      ],
      [
        { class_id: 'cl003', course_id: 'c003', room: 'A102教室', start_time: '09:00', end_time: '11:00' },
        { class_id: 'cl008', course_id: 'c008', room: 'A101教室', start_time: '14:00', end_time: '16:00' }
      ],
      [
        { class_id: 'cl008', course_id: 'c008', room: 'A101教室', start_time: '09:00', end_time: '11:00' },
        { class_id: 'cl001', course_id: 'c001', room: 'A101教室', start_time: '14:00', end_time: '16:00' }
      ],
      [
        { class_id: 'cl006', course_id: 'c006', room: 'A103教室', start_time: '09:00', end_time: '11:00' },
        { class_id: 'cl008', course_id: 'c008', room: 'A101教室', start_time: '14:00', end_time: '16:00' }
      ]
    ];

    let scheduleId = 100;
    weekSchedule.forEach((dayCourses, dayIndex) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + dayIndex);

      dayCourses.forEach(course => {
        schedules.push({
          id: 'sch' + String(scheduleId++).padStart(3, '0'),
          class_id: course.class_id,
          course_id: course.course_id,
          teacher_id: 't001',
          room: course.room,
          date: formatDate(date),
          start_time: course.start_time,
          end_time: course.end_time,
          duration: 2,
          status: date < today ? 'completed' : (date.toDateString() === today.toDateString() ? 'ongoing' : 'scheduled'),
          remarks: '',
          created_at: '2024-06-01'
        });
      });
    });

    return schedules;
  },

  _getStudentXiaomingWeekSchedule() {
    const today = new Date();
    const schedules = [];

    const formatDate = (date) => date.toISOString().split('T')[0];

    const weekSchedule = [
      { class_id: 'cl001', course_id: 'c001', room: 'A101教室', start_time: '09:00', end_time: '11:00' },
      { class_id: 'cl001', course_id: 'c001', room: 'A101教室', start_time: '14:00', end_time: '16:00' },
      { class_id: 'cl001', course_id: 'c001', room: 'A101教室', start_time: '09:00', end_time: '11:00' },
      { class_id: 'cl001', course_id: 'c001', room: 'A101教室', start_time: '14:00', end_time: '16:00' }
    ];

    let scheduleId = 200;
    weekSchedule.forEach((course, dayIndex) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayIndex);

      schedules.push({
        id: 'sch' + String(scheduleId++).padStart(3, '0'),
        class_id: course.class_id,
        course_id: course.course_id,
        teacher_id: 't001',
        room: course.room,
        date: formatDate(date),
        start_time: course.start_time,
        end_time: course.end_time,
        duration: 2,
        status: date.toDateString() === today.toDateString() ? 'ongoing' : 'scheduled',
        remarks: '',
        created_at: formatDate(today)
      });
    });

    return schedules;
  },

  schedules: [
    { id: 'sch001', class_id: 'cl001', course_id: 'c001', teacher_id: 't001', room: 'A101教室', date: '2024-04-15', start_time: '09:00', end_time: '11:00', duration: 2, status: 'completed', remarks: '', created_at: '2024-04-01' },
    { id: 'sch002', class_id: 'cl001', course_id: 'c001', teacher_id: 't001', room: 'A101教室', date: '2024-04-17', start_time: '09:00', end_time: '11:00', duration: 2, status: 'completed', remarks: '', created_at: '2024-04-01' },
    { id: 'sch003', class_id: 'cl002', course_id: 'c002', teacher_id: 't002', room: 'B203教室', date: '2024-04-16', start_time: '14:00', end_time: '16:00', duration: 2, status: 'completed', remarks: '', created_at: '2024-04-01' },
    { id: 'sch004', class_id: 'cl002', course_id: 'c002', teacher_id: 't002', room: 'B203教室', date: '2024-04-18', start_time: '14:00', end_time: '16:00', duration: 2, status: 'completed', remarks: '', created_at: '2024-04-01' },
    { id: 'sch005', class_id: 'cl003', course_id: 'c003', teacher_id: 't001', room: 'A102教室', date: '2024-04-19', start_time: '09:00', end_time: '11:00', duration: 2, status: 'completed', remarks: '', created_at: '2024-04-01' },
    { id: 'sch006', class_id: 'cl004', course_id: 'c004', teacher_id: 't003', room: 'C301教室', date: '2024-04-20', start_time: '09:00', end_time: '12:00', duration: 3, status: 'completed', remarks: '', created_at: '2024-04-01' },
    { id: 'sch007', class_id: 'cl005', course_id: 'c005', teacher_id: 't004', room: 'D102教室', date: '2024-04-21', start_time: '14:00', end_time: '17:00', duration: 3, status: 'completed', remarks: '', created_at: '2024-04-01' }
  ],

  // ==================== 考勤表 ====================
  attendances: [
    { id: 'att001', schedule_id: 'sch001', student_id: 's001', class_id: 'cl001', status: 'present', reason: '', checkin_time: '2024-04-15 09:05:00' },
    { id: 'att002', schedule_id: 'sch002', student_id: 's001', class_id: 'cl001', status: 'late', reason: '路上堵车', checkin_time: '2024-04-17 09:15:00' },
    { id: 'att003', schedule_id: 'sch003', student_id: 's002', class_id: 'cl002', status: 'present', reason: '', checkin_time: '2024-04-16 14:02:00' },
    { id: 'att004', schedule_id: 'sch003', student_id: 's004', class_id: 'cl002', status: 'present', reason: '', checkin_time: '2024-04-16 14:00:00' }
  ],

  // ==================== 成绩表 ====================
  grades: [
    { id: 'g001', student_id: 's001', class_id: 'cl001', course_id: 'c001', teacher_id: 't001', exam_type: '单元测试', score: 88, max_score: 100, comment: '成绩不错，继续保持', graded_at: '2024-04-05 16:00:00' },
    { id: 'g002', student_id: 's001', class_id: 'cl001', course_id: 'c001', teacher_id: 't001', exam_type: '月考', score: 92, max_score: 100, comment: '进步明显', graded_at: '2024-04-10 10:00:00' },
    { id: 'g003', student_id: 's002', class_id: 'cl002', course_id: 'c002', teacher_id: 't002', exam_type: '期中考试', score: 95, max_score: 100, comment: '优秀', graded_at: '2024-04-08 15:00:00' }
  ],

  // ==================== 作业表 ====================
  assignments: [
    { id: 'h001', class_id: 'cl001', course_id: 'c001', teacher_id: 't001', title: '数学单元测试卷', content: '完成课本第45-50页的练习题', attachments: [], deadline: '2024-04-15 23:59:59', is_notified: true, status: 'published', created_at: '2024-04-10 16:00:00' },
    { id: 'h002', class_id: 'cl002', course_id: 'c002', teacher_id: 't002', title: '英语阅读理解练习', content: '完成阅读理解练习册第10-15篇文章', attachments: [], deadline: '2024-04-16 18:00:00', is_notified: true, status: 'published', created_at: '2024-04-11 10:00:00' },
    { id: 'h003', class_id: 'cl003', course_id: 'c003', teacher_id: 't001', title: '物理计算题作业', content: '完成课后习题1-10题', attachments: [], deadline: '2024-04-18 20:00:00', is_notified: true, status: 'published', created_at: '2024-04-12 09:00:00' }
  ],

  // ==================== 作业提交表 ====================
  submissions: [
    { id: 'sub001', assignment_id: 'h001', student_id: 's001', content: '老师好，这是我的作业', attachments: [], score: 92, feedback: '完成得很好，继续保持', submit_time: '2024-04-12 19:30:00', grade_time: '2024-04-12 20:15:00', status: 'graded' },
    { id: 'sub002', assignment_id: 'h002', student_id: 's002', content: '作业已完成', attachments: [], score: 95, feedback: '优秀', submit_time: '2024-04-14 17:30:00', grade_time: '2024-04-14 18:00:00', status: 'graded' }
  ],

  // ==================== 公告表 ====================
  announcements: [
    { id: 'a001', title: '2024年春季班开课通知', content: '各位家长、老师、同学们：2024年春季班将于3月1日正式开课', type: 'system', target_grade: null, is_pinned: true, schedule_time: null, expire_time: '2024-06-30', publisher_id: 'admin001', status: 'published', created_at: '2024-02-20 10:00:00' },
    { id: 'a002', title: '家长开放日活动', content: '学校将于4月20日举办家长开放日活动', type: 'parent', target_grade: null, is_pinned: false, schedule_time: null, expire_time: '2024-04-20', publisher_id: 'admin001', status: 'published', created_at: '2024-04-10 09:00:00' },
    { id: 'a003', title: '教师教学研讨会', content: '请各位老师于4月15日下午2点参加教学研讨会', type: 'teacher', target_grade: null, is_pinned: false, schedule_time: null, expire_time: '2024-04-15', publisher_id: 'admin001', status: 'published', created_at: '2024-04-12 14:00:00' }
  ],

  // ==================== 报名记录表 ====================
  registrations: [
    {
      id: 'reg001',
      code: '1001',
      student_name: '周小雨',
      age: 15,
      gender: 'female',
      subject: '数学',
      parent_name: '周先生',
      parent_phone: '13800138001',
      status: 'enrolled',
      class_id: null,
      user_id: null,
      expire_time: '2026-06-21',
      created_at: '2026-05-21'
    },
    {
      id: 'reg002',
      code: '1002',
      student_name: '吴天明',
      age: 16,
      gender: 'male',
      subject: '英语',
      parent_name: '吴女士',
      parent_phone: '13800138002',
      status: 'paid',
      class_id: null,
      user_id: null,
      expire_time: '2026-06-15',
      created_at: '2026-05-15'
    },
    {
      id: 'reg003',
      code: '1003',
      student_name: '孙悦',
      age: 14,
      gender: 'female',
      subject: '物理',
      parent_name: '孙先生',
      parent_phone: '13800138003',
      status: 'admitted',
      class_id: 'cl003',
      user_id: null,
      expire_time: '2026-06-10',
      created_at: '2026-05-10'
    }
  ],

  // ==================== 消息表 ====================
  messages: [
    { id: 'msg001', receiver_id: 'teacher001', receiver_type: 'teacher', sender_id: 'admin001', sender_type: 'admin', title: '教学任务安排', content: '王老师您好，请于本周三上午9点到A101教室准备高三数学冲刺班的课程。', type: 'system', is_read: false, created_at: '2026-04-26 08:00:00' },
    { id: 'msg002', receiver_id: 'teacher001', receiver_type: 'teacher', sender_id: 'p001', sender_type: 'parent', title: '关于张小明请假', content: '王老师，张小明因病本周三无法上课，已提交请假申请，请知悉。', type: 'parent', is_read: false, created_at: '2026-04-25 16:30:00' },
    { id: 'msg003', receiver_id: 'teacher001', receiver_type: 'teacher', sender_id: 'admin001', sender_type: 'admin', title: '作业批改提醒', content: '您有5份学生作业待批改，请尽快完成批改工作。', type: 'task', is_read: true, created_at: '2026-04-24 10:00:00' },
    { id: 'msg004', receiver_id: 'teacher001', receiver_type: 'teacher', sender_id: 'p003', sender_type: 'parent', title: '感谢老师的教导', content: '李女士：张小明在您的指导下数学成绩进步很大，非常感谢！', type: 'parent', is_read: true, created_at: '2026-04-23 15:20:00' },
    { id: 'msg005', receiver_id: 'teacher001', receiver_type: 'teacher', sender_id: 'admin001', sender_type: 'admin', title: '教研活动通知', content: '本周五下午2点在会议室B召开数学教研活动，请准时参加。', type: 'system', is_read: true, created_at: '2026-04-22 09:00:00' },
    { id: 'msg006', receiver_id: 'teacher002', receiver_type: 'teacher', sender_id: 'admin001', sender_type: 'admin', title: '课程调整通知', content: '李老师，高一英语1班下周课程时间有所调整，请查收新课表。', type: 'system', is_read: false, created_at: '2026-04-26 07:30:00' },
    { id: 'msg007', receiver_id: 'teacher002', receiver_type: 'teacher', sender_id: 'p002', sender_type: 'parent', title: '关于赵小刚英语学习', content: '赵先生：老师您好，我家小刚最近英语单词听写不太理想，请问有什么建议吗？', type: 'parent', is_read: false, created_at: '2026-04-25 20:15:00' }
  ],

  // ==================== 教学资料表 ====================
  teaching_materials: [
    {
      id: 'tm001',
      teacher_id: 't001',
      title: '高三数学导数专题课件',
      category: 'courseware',
      subject: '数学',
      description: '涵盖导数定义、求导法则、应用题三大板块',
      file_type: 'pptx',
      file_name: '导数专题.pptx',
      file_size: 5242880,
      file_url: '/mock/files/导数专题.pptx',
      thumbnail: '',
      folder_id: 'tf001',
      shared_class_ids: ['cl001', 'cl006'],
      is_shared: true,
      download_count: 12,
      tags: ['高考', '导数', '重点'],
      status: 'active',
      created_at: '2026-03-15 10:00:00',
      updated_at: '2026-03-15 10:00:00'
    },
    {
      id: 'tm002',
      teacher_id: 't001',
      title: '数学冲刺班教案-第5周',
      category: 'lesson_plan',
      subject: '数学',
      description: '第5周教学计划与教案',
      file_type: 'docx',
      file_name: '第5周教案.docx',
      file_size: 1048576,
      file_url: '/mock/files/第5周教案.docx',
      thumbnail: '',
      folder_id: 'tf002',
      shared_class_ids: ['cl001'],
      is_shared: true,
      download_count: 5,
      tags: ['教案', '第5周'],
      status: 'active',
      created_at: '2026-04-01 14:00:00',
      updated_at: '2026-04-01 14:00:00'
    },
    {
      id: 'tm003',
      teacher_id: 't001',
      title: '物理力学综合练习',
      category: 'exercise',
      subject: '物理',
      description: '力学章节综合练习题含答案',
      file_type: 'pdf',
      file_name: '力学综合练习.pdf',
      file_size: 2097152,
      file_url: '/mock/files/力学综合练习.pdf',
      thumbnail: '',
      folder_id: 'tf003',
      shared_class_ids: ['cl003'],
      is_shared: true,
      download_count: 23,
      tags: ['练习', '力学'],
      status: 'active',
      created_at: '2026-04-10 09:00:00',
      updated_at: '2026-04-10 09:00:00'
    },
    {
      id: 'tm004',
      teacher_id: 't001',
      title: '高考数学公式汇总',
      category: 'reference',
      subject: '数学',
      description: '高考常用数学公式速查手册',
      file_type: 'pdf',
      file_name: '公式汇总.pdf',
      file_size: 3145728,
      file_url: '/mock/files/公式汇总.pdf',
      thumbnail: '',
      folder_id: 'tf001',
      shared_class_ids: ['cl001', 'cl006'],
      is_shared: true,
      download_count: 45,
      tags: ['公式', '高考', '参考资料'],
      status: 'active',
      created_at: '2026-02-20 08:00:00',
      updated_at: '2026-03-01 10:00:00'
    },
    {
      id: 'tm005',
      teacher_id: 't002',
      title: '英语阅读理解技巧',
      category: 'courseware',
      subject: '英语',
      description: '阅读理解题型分析与解题技巧',
      file_type: 'pptx',
      file_name: '阅读理解技巧.pptx',
      file_size: 4194304,
      file_url: '/mock/files/阅读理解技巧.pptx',
      thumbnail: '',
      folder_id: 'tf004',
      shared_class_ids: ['cl002'],
      is_shared: true,
      download_count: 8,
      tags: ['阅读', '技巧'],
      status: 'active',
      created_at: '2026-03-20 11:00:00',
      updated_at: '2026-03-20 11:00:00'
    },
    {
      id: 'tm006',
      teacher_id: 't001',
      title: '2025年期中试卷',
      category: 'exercise',
      subject: '数学',
      description: '高三数学2025年期中考试试卷',
      file_type: 'pdf',
      file_name: '2025期中试卷.pdf',
      file_size: 1572864,
      file_url: '/mock/files/2025期中试卷.pdf',
      thumbnail: '',
      folder_id: null,
      shared_class_ids: [],
      is_shared: false,
      download_count: 3,
      tags: ['试卷', '期中'],
      status: 'active',
      created_at: '2026-01-15 16:00:00',
      updated_at: '2026-01-15 16:00:00'
    }
  ],

  // ==================== 资料文件夹表 ====================
  teaching_folders: [
    {
      id: 'tf001',
      teacher_id: 't001',
      name: '高三数学资料',
      subject: '数学',
      parent_id: null,
      material_count: 2,
      sort_order: 0,
      created_at: '2026-01-10 10:00:00'
    },
    {
      id: 'tf002',
      teacher_id: 't001',
      name: '教案存档',
      subject: '数学',
      parent_id: null,
      material_count: 1,
      sort_order: 1,
      created_at: '2026-02-01 10:00:00'
    },
    {
      id: 'tf003',
      teacher_id: 't001',
      name: '物理习题库',
      subject: '物理',
      parent_id: null,
      material_count: 1,
      sort_order: 2,
      created_at: '2026-03-01 10:00:00'
    },
    {
      id: 'tf004',
      teacher_id: 't002',
      name: '英语教学资源',
      subject: '英语',
      parent_id: null,
      material_count: 1,
      sort_order: 0,
      created_at: '2026-02-15 10:00:00'
    }
  ],

  // ==================== 学生作品集表 ====================
  student_portfolios: [
    {
      id: 'sp001',
      student_id: 's001',
      class_id: 'cl001',
      teacher_id: 't001',
      title: '导数大题作业-满分',
      category: 'exam_paper',
      description: '张小明导数单元测试满分试卷，解题过程规范',
      file_type: 'jpg',
      file_name: '导数试卷-s001.jpg',
      file_size: 2097152,
      file_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=200&fit=crop',
      is_featured: true,
      is_excellent: true,
      tags: ['满分', '导数', '规范'],
      teacher_comment: '解题过程非常规范，思路清晰，值得其他同学学习！',
      work_date: '2026-04-05',
      status: 'active',
      created_at: '2026-04-05 16:00:00',
      updated_at: '2026-04-05 16:00:00'
    },
    {
      id: 'sp002',
      student_id: 's001',
      class_id: 'cl001',
      teacher_id: 't001',
      title: '数学思维导图-函数',
      category: 'homework',
      description: '函数章节思维导图作业',
      file_type: 'png',
      file_name: '函数思维导图-s001.png',
      file_size: 1572864,
      file_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=200&fit=crop',
      is_featured: false,
      is_excellent: true,
      tags: ['思维导图', '函数'],
      teacher_comment: '结构完整，逻辑清晰',
      work_date: '2026-03-20',
      status: 'active',
      created_at: '2026-03-20 14:00:00',
      updated_at: '2026-03-20 14:00:00'
    },
    {
      id: 'sp003',
      student_id: 's002',
      class_id: 'cl002',
      teacher_id: 't002',
      title: '英语演讲稿-My Dream',
      category: 'essay',
      description: '英语作文：My Dream',
      file_type: 'jpg',
      file_name: '英语作文-s002.jpg',
      file_size: 1048576,
      file_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop',
      is_featured: true,
      is_excellent: true,
      tags: ['英语写作', '优秀作文'],
      teacher_comment: '表达流畅，用词丰富，非常出色！',
      work_date: '2026-04-08',
      status: 'active',
      created_at: '2026-04-08 15:00:00',
      updated_at: '2026-04-08 15:00:00'
    },
    {
      id: 'sp004',
      student_id: 's004',
      class_id: 'cl002',
      teacher_id: 't002',
      title: '英语配音作品',
      category: 'artwork',
      description: '英语配音练习-电影片段',
      file_type: 'mp4',
      file_name: '配音-s004.mp4',
      file_size: 8388608,
      file_url: '',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop',
      is_featured: false,
      is_excellent: false,
      tags: ['配音', '口语'],
      teacher_comment: '语音语调有进步，继续加油',
      work_date: '2026-04-12',
      status: 'active',
      created_at: '2026-04-12 10:00:00',
      updated_at: '2026-04-12 10:00:00'
    },
    {
      id: 'sp005',
      student_id: 's003',
      class_id: 'cl003',
      teacher_id: 't001',
      title: '物理实验报告-弹簧振子',
      category: 'homework',
      description: '弹簧振子实验报告',
      file_type: 'pdf',
      file_name: '实验报告-s003.pdf',
      file_size: 2621440,
      file_url: '',
      thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=200&fit=crop',
      is_featured: false,
      is_excellent: false,
      tags: ['实验', '力学'],
      teacher_comment: '数据记录准确，分析部分需更详细',
      work_date: '2026-04-15',
      status: 'active',
      created_at: '2026-04-15 17:00:00',
      updated_at: '2026-04-15 17:00:00'
    }
  ],

  // ==================== 统计缓存（自动计算） ====================
  _computeStats() {
    return {
      teacherCount: this.teachers.filter(t => t.status === 'active').length,
      studentCount: this.students.filter(s => s.status === 'active').length,
      classCount: this.classes.filter(c => c.status === 'active').length,
      courseCount: this.courses.filter(c => c.status === 'active').length,
      monthNewStudents: this.students.filter(s => {
        const created = new Date(s.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length
    };
  },

  // ==================== 机构品牌信息 ====================
  school_profile: {
    id: 'sp001',
    name: '星程培训中心',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop',
    description: '星程培训中心成立于2018年，专注于中小学文化课辅导和艺术素养培养。我们拥有一支经验丰富的教师团队，采用小班化教学模式，关注每一位学生的成长与进步。',
    slogan: '让每个孩子都发光',
    features: [
      { icon: '👨‍🏫', text: '名师授课' },
      { icon: '📊', text: '成长可视' },
      { icon: '🎯', text: '精准教学' },
      { icon: '🏫', text: '小班教学' },
      { icon: '⏰', text: '灵活排课' },
      { icon: '🏆', text: '成绩保障' }
    ],
    contact_phone: '400-888-9999',
    address: '北京市海淀区中关村大街88号星程大厦3层',
    latitude: 39.9842,
    longitude: 116.3164,
    business_hours: '周一至周五 14:00-21:00 / 周六日 09:00-18:00',
    updated_at: '2026-05-20 10:00:00'
  },

  // ==================== 成长报告表 ====================
  growth_reports: [
    {
      id: 'gr001',
      student_id: 's001',
      class_id: 'cl001',
      period: 'weekly',
      date_range: '2026-05-26 ~ 2026-06-01',
      attendance_rate: 100,
      attendance_count: 3,
      attendance_total: 3,
      attendance_trend: 10,
      homework_rate: 100,
      homework_trend: 5,
      score_avg: 92,
      score_trend: 8,
      excellent_count: 2,
      overall_level: '进步明显',
      encouragement: '小明本周表现非常出色！全勤、作业全优，成绩还在稳步提升，继续保持！',
      teacher_comment: '小明本周在导数章节的学习中表现突出，解题思路更加清晰。建议继续保持每日练习的习惯，下周我们将进入积分部分，可以提前预习基本概念。',
      teacher_name: '王老师',
      score_history: [
        { label: '第1周', score: 78 },
        { label: '第2周', score: 82 },
        { label: '第3周', score: 85 },
        { label: '第4周', score: 88 },
        { label: '本周', score: 92 }
      ],
      portfolio_items: [
        { id: 'sp001', title: '导数大题-满分', thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=200&fit=crop', date: '05-28' },
        { id: 'sp002', title: '函数图像手绘', thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200&h=200&fit=crop', date: '05-30' }
      ],
      created_at: '2026-06-01 20:00:00'
    },
    {
      id: 'gr002',
      student_id: 's001',
      class_id: 'cl001',
      period: 'monthly',
      date_range: '2026-05-01 ~ 2026-05-31',
      attendance_rate: 95,
      attendance_count: 11,
      attendance_total: 12,
      attendance_trend: 5,
      homework_rate: 96,
      homework_trend: 8,
      score_avg: 89,
      score_trend: 12,
      excellent_count: 5,
      overall_level: '持续进步',
      encouragement: '5月份小明在学习上投入了很多努力，进步非常显著，尤其是数学成绩提升明显！',
      teacher_comment: '小明这个月整体进步很大，尤其在数学思维和解题速度上有明显提升。英语写作还需要加强，建议多阅读英文文章，积累表达方式。',
      teacher_name: '王老师',
      score_history: [
        { label: '1月', score: 72 },
        { label: '2月', score: 76 },
        { label: '3月', score: 80 },
        { label: '4月', score: 84 },
        { label: '5月', score: 89 }
      ],
      portfolio_items: [
        { id: 'sp001', title: '导数大题-满分', thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&h=200&fit=crop', date: '05-28' }
      ],
      created_at: '2026-06-01 22:00:00'
    }
  ],

  // ==================== 推荐关系表 ====================
  referrals: [
    {
      id: 'ref001',
      referrer_parent_id: 'p001',
      invitee_phone: '13800001111',
      invitee_name: '刘芳',
      status: 'enrolled',
      reward_claimed: true,
      created_at: '2026-04-15 10:00:00'
    },
    {
      id: 'ref002',
      referrer_parent_id: 'p001',
      invitee_phone: '13900002222',
      invitee_name: '赵磊',
      status: 'trial',
      reward_claimed: false,
      created_at: '2026-05-10 14:00:00'
    },
    {
      id: 'ref003',
      referrer_parent_id: 'p001',
      invitee_phone: '',
      invitee_name: '微信好友',
      status: 'pending',
      reward_claimed: false,
      created_at: '2026-05-28 09:00:00'
    }
  ],

  referral_stats: {
    total: 3,
    trial: 1,
    enrolled: 1,
    rewards: 1
  },

  // ==================== 试听体验报告表 ====================
  trial_reports: [
    {
      id: 'tr001',
      student_name: '李小红',
      parent_phone: '13700003333',
      class_id: 'cl001',
      class_name: '数学提高班',
      teacher_id: 't001',
      teacher_name: '王老师',
      status: 'sent',
      performance_score: 85,
      participation: 90,
      focus: 80,
      response: 85,
      creativity: 75,
      interest_level: 4,
      interest_comment: '对数学解题表现出浓厚兴趣，尤其喜欢有挑战性的题目，课堂互动积极。',
      ability_scores: [
        { dimension: '逻辑思维', score: 88, comment: '推理过程清晰，能快速抓住问题核心' },
        { dimension: '计算能力', score: 75, comment: '基本计算准确，复杂运算需提升速度' },
        { dimension: '空间想象', score: 70, comment: '几何直觉不错，需要更多图形训练' },
        { dimension: '表达沟通', score: 82, comment: '能清楚表达思路，互动积极' }
      ],
      recommended_course: {
        id: 'c001',
        name: '数学提高班',
        description: '针对有一定数学基础的学生，通过系统训练提升解题能力和思维深度，适合逻辑思维突出的同学。',
        match_percent: 92,
        duration: '16次课/期',
        schedule: '每周二、四 18:00-20:00'
      },
      discount_info: {
        description: '试听后7天内报名享9折优惠，再送1节免费辅导课！',
        valid_until: '2026-06-09T23:59:59'
      },
      teacher_comment: '小红在试听课上表现很好，思维敏捷，互动积极。建议尽快系统学习，不要浪费这个好基础！',
      created_at: '2026-06-02 15:00:00'
    }
  ],

  // ==================== 家长评价表 ====================
  reviews: [
    {
      id: 'rv001',
      parent_name: '张妈妈',
      score: 10,
      stars: [true, true, true, true, true],
      comment: '孩子在这里学了一学期，成绩提升很明显，更重要的是学习兴趣提高了，老师非常负责任！',
      date: '2026-05-15'
    },
    {
      id: 'rv002',
      parent_name: '陈爸爸',
      score: 9,
      stars: [true, true, true, true, true],
      comment: '每周的成长报告很贴心，能看到孩子具体的进步，推荐给身边好几个朋友了。',
      date: '2026-05-20'
    },
    {
      id: 'rv003',
      parent_name: '王妈妈',
      score: 9,
      stars: [true, true, true, true, true],
      comment: '老师很专业，会根据孩子的情况调整教学方案，小班教学效果确实好。',
      date: '2026-04-28'
    }
  ]
};

module.exports = { mockData, MATERIAL_CATEGORIES, PORTFOLIO_CATEGORIES };
