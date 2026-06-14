/**
 * 培训中心管理系统 - Mock 数据层入口
 * 
 * 由以下模块组装：
 * - mock-data.js: 数据表 + 常量
 * - mock-methods-user.js: 登录 + 教师 + 学生 + 家长
 * - mock-methods-class.js: 班级 + 课程 + 选课 + 排课
 * - mock-methods-academic.js: 考勤 + 成绩 + 作业 + 公告
 * - mock-methods-portal.js: 教师端 + 家长端 + 认证 + 统计
 * - mock-methods-registration.js: 报名
 * - mock-methods-materials.js: 教学资料 + 文件夹 + 作品集
 * - mock-methods-points.js: 积分 + 分享 + 礼品 + 兑换 + 成长报告 + 推荐 + 机构 + 试听 + 评价
 */

const { mockData } = require('./mock-data');

// 合并所有方法模块
Object.assign(mockData, require('./mock-methods-user'));
Object.assign(mockData, require('./mock-methods-class'));
Object.assign(mockData, require('./mock-methods-academic'));
Object.assign(mockData, require('./mock-methods-portal'));
Object.assign(mockData, require('./mock-methods-registration'));
Object.assign(mockData, require('./mock-methods-materials'));
Object.assign(mockData, require('./mock-methods-points'));

module.exports = mockData;
