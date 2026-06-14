# 培训中心管理系统 — 后端技术文档

> 版本: v1.0 | 更新日期: 2026-05-26

---

## 1. 项目概述

### 1.1 背景

培训中心管理系统是一个面向 K-12 课外培训机构的全流程管理平台，前端为微信小程序，已开发完成。前端目前通过 `data/mock.js` 模拟全部数据，需要开发后端 API 服务替换 mock 层，实现真实数据持久化和业务逻辑。

### 1.2 系统角色

| 角色 | 说明 | 核心功能 |
|------|------|----------|
| 管理员 (admin) | 机构管理者 | 教师管理、学生管理、班级管理、报名审批、统计看板 |
| 教师 (teacher) | 授课教师 | 排课查看、考勤管理、作业发布与批改、教学资料管理 |
| 家长 (parent) | 学生家长 | 查看孩子课表、成绩、考勤、作业、作品集 |

### 1.3 技术选型

| 层面 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| Web 框架 | FastAPI | 0.115+ | 高性能异步、自动生成 OpenAPI 文档、类型安全 |
| ORM | SQLAlchemy | 2.0+ | Python 生态最成熟的 ORM，支持异步 |
| 数据库 | MySQL | 8.0+ | 关系型数据、JSON 支持、社区成熟 |
| 异步驱动 | aiomysql | 0.2+ | SQLAlchemy 异步 MySQL 驱动 |
| 数据校验 | Pydantic | 2.10+ | 请求/响应校验，与 FastAPI 深度集成 |
| 配置管理 | PyYAML + pydantic-settings | 6.0+ / 2.6+ | YAML 配置文件 + 多环境 Profile |
| 数据库迁移 | Alembic | 1.14+ | SQLAlchemy 官方迁移工具 |
| 认证 | JWT (python-jose) | 3.3+ | 无状态认证，适合小程序场景 |
| 缓存 | Redis | 7+ | Token 黑名单、统计缓存 |
| 部署 | Docker + Uvicorn | - | 容器化部署，异步 ASGI 服务器 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                      微信小程序 (前端)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐       │
│  │ 管理员端  │ │ 教师端   │ │ 家长端   │ │  登录/注册    │       │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘ └──────┬───────┘       │
│        └─────────────┴────────────┴─────────────┘               │
│                          │  HTTPS + JSON                        │
│                    ┌─────┴─────┐                                 │
│                    │  wx.request│                                │
│                    └─────┬─────┘                                 │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    FastAPI 后端                                   │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────┐          │
│  │              中间件层 (Middleware)                  │          │
│  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │          │
│  │  │  CORS  │ │请求日志   │ │异常处理   │ │ 认证   │ │          │
│  │  └────────┘ └──────────┘ └──────────┘ └────────┘ │          │
│  └───────────────────────┬───────────────────────────┘          │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────┐          │
│  │           Router 层 (Controller)                   │          │
│  │  /auth  /users  /teachers  /students  /classes ... │          │
│  │  请求校验(Schema) → 调用Service → 包装响应          │          │
│  └───────────────────────┬───────────────────────────┘          │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────┐          │
│  │           Service 层 (业务逻辑)                     │          │
│  │  认证授权 │ 级联操作 │ 业务规则校验 │ 事务管理       │          │
│  └───────────────────────┬───────────────────────────┘          │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────┐          │
│  │         Repository 层 (数据访问/DAO)                │          │
│  │  BaseRepository[T] → 各实体 Repository             │          │
│  │  CRUD + 分页 + 实体特定查询                         │          │
│  └───────────────────────┬───────────────────────────┘          │
│                          │                                       │
│  ┌───────────┐  ┌───────┴───────┐  ┌──────────────────┐        │
│  │  Model层  │  │  Schema/DTO层 │  │  Dependencies层  │        │
│  │ ORM实体   │  │ 请求/响应模型  │  │  DB/认证/分页    │        │
│  └─────┬─────┘  └───────────────┘  └──────────────────┘        │
│        │                                                         │
└────────┼────────────────────────────────────────────────────────┘
         │
┌────────┼────────────────────────────────────────────────────────┐
│   数据层                                                        │
│   ┌─────┴──────┐   ┌────────────┐   ┌──────────────────┐       │
│   │   MySQL    │   │   Redis    │   │  文件存储         │       │
│   │  18张表    │   │ Token/缓存 │   │ 本地/OSS         │       │
│   └────────────┘   └────────────┘   └──────────────────┘       │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 分层架构详图

```
┌─────────────────────────────────────────────────────┐
│                  请求处理流程                         │
│                                                     │
│  HTTP Request                                       │
│      │                                              │
│      ▼                                              │
│  ┌──────────┐    认证/权限校验                       │
│  │Middleware │ ── Depends(get_current_user) ──────┐ │
│  └────┬─────┘    CORS/日志/异常                    │ │
│       │                                         │ │
│       ▼                                         ▼ │
│  ┌──────────┐    请求参数校验                    ┌──┴─┐
│  │  Router  │ ── Schema(Create/Update) ───────►│Dep │
│  │(Control.)│                                  │endi│
│  └────┬─────┘    注入Service+DB               │es  │
│       │              │                         └──┬─┘
│       ▼              ▼                            │
│  ┌──────────┐   ┌──────────┐                      │
│  │ Service  │◄──│ Session  │                      │
│  │ 业务逻辑 │   │  (get_db) │                      │
│  └────┬─────┘   └──────────┘                      │
│       │                                           │
│       ▼                                           │
│  ┌──────────┐                                     │
│  │Repository│  SQL查询 → 返回ORM对象               │
│  │  (DAO)   │                                     │
│  └────┬─────┘                                     │
│       │                                           │
│       ▼                                           │
│  ┌──────────┐                                     │
│  │  Model   │  ORM → MySQL                       │
│  │ (Entity) │                                     │
│  └────┬─────┘                                     │
│       │                                           │
│       ▼                                           │
│     MySQL                                         │
│                                                     │
│  响应处理流程 (反向):                                │
│  MySQL → Model → Repository → Service → Router     │
│       → Schema(Out) 序列化 → APIResponse包装 → JSON │
└─────────────────────────────────────────────────────┘
```

### 2.3 Java Spring Boot 对照表

| Java 概念 | Java 注解 | Python/FastAPI 对应 | 文件位置 |
|-----------|----------|-------------------|----------|
| Controller | @RestController | APIRouter | `app/routers/` |
| Service | @Service | Service 类 | `app/services/` |
| Repository/Mapper | @Repository / MyBatis Mapper | Repository 类 | `app/repositories/` |
| Entity | @Entity / @Table | SQLAlchemy Model | `app/models/` |
| DTO / VO | POJO | Pydantic Model | `app/schemas/` |
| 依赖注入 | @Autowired | FastAPI Depends() | `app/dependencies/` |
| 事务管理 | @Transactional | Service 层 session.commit() | `app/services/` |
| 全局异常 | @ControllerAdvice | 全局异常中间件 | `app/middleware/error_handler.py` |
| 配置文件 | application.yml | YAML + Pydantic Settings | `app/config/settings.py` + `configs/` |
| 拦截器 | HandlerInterceptor | Starlette Middleware | `app/middleware/` |
| 数据库迁移 | Flyway / Liquibase | Alembic | `alembic/` |
| 参数校验 | @Valid / @NotNull | Pydantic 自动校验 | `app/schemas/` |
| AOP 日志 | @Aspect | 请求日志中间件 | `app/middleware/request_log.py` |

---

## 3. 数据库设计

### 3.1 ER 关系图

```
┌─────────┐ 1:1 ┌──────────┐
│  User   │─────│  Teacher │──┐
│(登录账号)│     │ (教师)   │  │
└────┬────┘     └──────────┘  │ 1:N
     │ 1:1                    │
     │         ┌──────────┐   ▼
     ├─────────│  Parent  │ ┌────────┐ 1:N ┌──────────┐
     │         │  (家长)  │─│ Class  │─────│ Schedule │
     │         └────┬─────┘ │(班级)  │     └──────────┘
     │              │ 1:N   └───┬────┘          │
     │              ▼           │ 1:N            │ 1:N
     │         ┌──────────┐    ▼           ┌────┴───────┐
     │         │ Student  │ ┌───────────┐  │ Attendance │
     │         │  (学生)  │ │Enrollment │  │  (考勤)    │
     │         └────┬─────┘ │(选课 M:N) │  └────────────┘
     │              │       └───────────┘
     │              │            ▲
     │              │ M:N        │
     │              └────────────┘
     │
     │         ┌──────────┐
     │         │  Course  │ 1:N ──── Class
     │         │  (课程)  │
     │         └──────────┘
     │
     │    ┌──────────────┐ 1:N ┌────────────┐ 1:N ┌────────────┐
     │    │  Assignment  │─────│ Submission │     │   Grade    │
     │    │  (作业)      │     │(作业提交)  │     │  (成绩)    │
     │    └──────────────┘     └────────────┘     └────────────┘
     │
     │    ┌──────────────┐     ┌──────────────────────┐
     │    │Announcement  │     │   Registration       │
     │    │  (公告)      │     │   (报名记录)         │
     │    └──────────────┘     └──────────────────────┘
     │
     │    ┌──────────────┐     ┌──────────────────────┐
     │    │   Message    │     │  TeachingFolder      │ 1:N
     │    │  (消息)      │     │   (资料文件夹)       │────┐
     │    └──────────────┘     └──────────────────────┘    │
     │                                                    ▼
     │                            ┌──────────────────────┐
     │                            │ TeachingMaterial     │
     │                            │  (教学资料)          │
     │                            └──────────┬───────────┘
     │                                       │ M:N
     │                            ┌──────────┴───────────┐
     │                            │ material_class_shares│
     │                            │  (资料-班级关联)     │
     │                            └──────────────────────┘
     │
     │    ┌──────────────────────┐
     │    │  StudentPortfolio    │
     │    │   (学生作品集)       │
     │    └──────────────────────┘
```

### 3.2 表结构详细设计

#### 3.2.1 users — 用户表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 手机号（登录账号） |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 密码哈希 |
| role | ENUM('admin','teacher','parent') | NOT NULL, INDEX | 角色 |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| avatar | VARCHAR(500) | DEFAULT '' | 头像 URL |
| wx_openid | VARCHAR(100) | UNIQUE, NULLABLE, INDEX | 微信 openid |
| status | ENUM('active','inactive') | DEFAULT 'active', INDEX | 状态 |
| created_at | DATETIME | DEFAULT NOW() | 创建时间 |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | 更新时间 |

#### 3.2.2 teachers — 教师表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| user_id | VARCHAR(36) | FK→users.id, UNIQUE | 关联用户 |
| employee_no | VARCHAR(20) | UNIQUE | 工号 |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| phone | VARCHAR(20) | | 联系电话 |
| email | VARCHAR(100) | | 邮箱 |
| avatar | VARCHAR(500) | | 头像 |
| subjects | JSON | | 科目数组，如 ["数学","物理"] |
| grade | VARCHAR(20) | | 学段，如 "高中部" |
| education | VARCHAR(20) | | 学历 |
| school | VARCHAR(50) | | 毕业院校 |
| entry_date | DATE | | 入职日期 |
| status | ENUM('active','inactive') | DEFAULT 'active', INDEX | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.3 students — 学生表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| student_no | VARCHAR(20) | UNIQUE | 学号 |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| gender | ENUM('male','female') | | 性别 |
| birthday | DATE | | 出生日期 |
| grade | VARCHAR(20) | | 年级 |
| parent_id | VARCHAR(36) | FK→parents.id, INDEX | 关联家长 |
| address | VARCHAR(200) | | 地址 |
| tags | JSON | | 标签数组，如 ["活跃","需关注"] |
| remarks | TEXT | | 备注 |
| status | ENUM('active','inactive') | DEFAULT 'active', INDEX | 状态 |
| enrolled_date | DATE | | 入学日期 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.4 parents — 家长表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| user_id | VARCHAR(36) | FK→users.id, UNIQUE | 关联用户 |
| name | VARCHAR(50) | NOT NULL | 姓名 |
| phone | VARCHAR(20) | | 联系电话 |
| relation | VARCHAR(20) | | 关系（母亲/父亲/其他） |
| status | ENUM('active','inactive') | DEFAULT 'active' | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.5 courses — 课程表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| name | VARCHAR(100) | NOT NULL | 课程名称 |
| subject | VARCHAR(20) | NOT NULL, INDEX | 科目 |
| grade | VARCHAR(20) | INDEX | 适用年级 |
| description | TEXT | | 课程描述 |
| textbook | VARCHAR(100) | | 教材 |
| capacity | INT | DEFAULT 30 | 最大容量 |
| is_open | BOOLEAN | DEFAULT TRUE | 是否开放选课 |
| status | ENUM('active','inactive') | DEFAULT 'active' | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.6 classes — 班级表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| name | VARCHAR(100) | NOT NULL | 班级名称 |
| course_id | VARCHAR(36) | FK→courses.id, INDEX | 关联课程 |
| teacher_id | VARCHAR(36) | FK→teachers.id, INDEX | 授课教师 |
| assistant_id | VARCHAR(36) | FK→teachers.id, NULLABLE | 助教 |
| room | VARCHAR(50) | | 教室 |
| capacity | INT | DEFAULT 30 | 班级容量 |
| start_date | DATE | | 开课日期 |
| end_date | DATE | | 结课日期 |
| schedule | VARCHAR(200) | | 课表描述（如 "周一、周三 09:00-11:00"） |
| remarks | TEXT | | 备注 |
| status | ENUM('active','inactive','completed') | DEFAULT 'active', INDEX | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.7 enrollments — 选课表（学生-班级 M:N）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| student_id | VARCHAR(36) | FK→students.id, INDEX | 学生 |
| class_id | VARCHAR(36) | FK→classes.id, INDEX | 班级 |
| course_id | VARCHAR(36) | FK→courses.id | 课程 |
| status | ENUM('active','withdrawn') | DEFAULT 'active' | 状态 |
| enroll_time | DATETIME | | 选课时间 |
| approve_time | DATETIME | | 审批时间 |
| created_at | DATETIME | DEFAULT NOW() | |

UNIQUE 约束: (student_id, class_id)

#### 3.2.8 schedules — 排课表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| class_id | VARCHAR(36) | FK→classes.id, INDEX | 班级 |
| course_id | VARCHAR(36) | FK→courses.id | 课程 |
| teacher_id | VARCHAR(36) | FK→teachers.id, INDEX | 教师 |
| room | VARCHAR(50) | | 教室 |
| date | DATE | NOT NULL, INDEX | 上课日期 |
| start_time | VARCHAR(5) | NOT NULL | 开始时间 (HH:MM) |
| end_time | VARCHAR(5) | NOT NULL | 结束时间 (HH:MM) |
| duration | INT | | 课时（小时） |
| status | ENUM('scheduled','ongoing','completed','cancelled') | DEFAULT 'scheduled' | 状态 |
| remarks | TEXT | | 备注 |
| created_at | DATETIME | DEFAULT NOW() | |

INDEX: (teacher_id, date), (class_id, date)

#### 3.2.9 attendances — 考勤表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| schedule_id | VARCHAR(36) | FK→schedules.id, INDEX | 排课 |
| student_id | VARCHAR(36) | FK→students.id, INDEX | 学生 |
| class_id | VARCHAR(36) | FK→classes.id, INDEX | 班级 |
| status | ENUM('present','late','absent','leave') | NOT NULL | 出勤状态 |
| reason | VARCHAR(200) | | 请假/迟到原因 |
| checkin_time | DATETIME | | 签到时间 |
| created_at | DATETIME | DEFAULT NOW() | |

UNIQUE 约束: (schedule_id, student_id)

#### 3.2.10 grades — 成绩表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| student_id | VARCHAR(36) | FK→students.id, INDEX | 学生 |
| class_id | VARCHAR(36) | FK→classes.id, INDEX | 班级 |
| course_id | VARCHAR(36) | FK→courses.id | 课程 |
| teacher_id | VARCHAR(36) | FK→teachers.id | 录入教师 |
| exam_type | VARCHAR(50) | NOT NULL | 考试类型（单元测试/月考/期中/期末） |
| score | DECIMAL(5,2) | NOT NULL | 分数 |
| max_score | DECIMAL(5,2) | DEFAULT 100 | 满分 |
| comment | TEXT | | 评语 |
| graded_at | DATETIME | | 录入时间 |
| created_at | DATETIME | DEFAULT NOW() | |

INDEX: (student_id, class_id)

#### 3.2.11 assignments — 作业表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| class_id | VARCHAR(36) | FK→classes.id, INDEX | 班级 |
| course_id | VARCHAR(36) | FK→courses.id | 课程 |
| teacher_id | VARCHAR(36) | FK→teachers.id | 发布教师 |
| title | VARCHAR(200) | NOT NULL | 作业标题 |
| content | TEXT | | 作业内容 |
| attachments | JSON | | 附件列表 |
| deadline | DATETIME | | 截止时间 |
| is_notified | BOOLEAN | DEFAULT FALSE | 是否已通知 |
| status | ENUM('draft','published','closed') | DEFAULT 'draft' | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.12 submissions — 作业提交表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| assignment_id | VARCHAR(36) | FK→assignments.id, INDEX | 作业 |
| student_id | VARCHAR(36) | FK→students.id, INDEX | 学生 |
| content | TEXT | | 提交内容 |
| attachments | JSON | | 附件列表 |
| score | DECIMAL(5,2) | NULLABLE | 评分 |
| feedback | TEXT | | 教师反馈 |
| submit_time | DATETIME | | 提交时间 |
| grade_time | DATETIME | | 批改时间 |
| status | ENUM('submitted','graded','returned') | DEFAULT 'submitted' | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |

UNIQUE 约束: (assignment_id, student_id)

#### 3.2.13 announcements — 公告表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | TEXT | NOT NULL | 内容 |
| type | ENUM('system','teacher','parent') | NOT NULL, INDEX | 类型 |
| target_grade | VARCHAR(20) | NULLABLE | 目标年级 |
| is_pinned | BOOLEAN | DEFAULT FALSE | 是否置顶 |
| schedule_time | DATETIME | NULLABLE | 定时发布 |
| expire_time | DATETIME | NULLABLE | 过期时间 |
| publisher_id | VARCHAR(36) | FK→users.id | 发布者 |
| status | ENUM('draft','published','expired') | DEFAULT 'draft' | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.14 registrations — 报名记录表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| code | VARCHAR(20) | UNIQUE | 报名编号 |
| student_name | VARCHAR(50) | NOT NULL | 学生姓名 |
| age | INT | | 年龄 |
| gender | ENUM('male','female') | | 性别 |
| subject | VARCHAR(20) | | 报名科目 |
| parent_name | VARCHAR(50) | | 家长姓名 |
| parent_phone | VARCHAR(20) | INDEX | 家长电话 |
| status | ENUM('pending','paid','admitted','enrolled','rejected') | DEFAULT 'pending', INDEX | 状态 |
| class_id | VARCHAR(36) | FK→classes.id, NULLABLE | 分配班级 |
| user_id | VARCHAR(36) | FK→users.id, NULLABLE | 关联用户（审批后创建） |
| expire_time | DATETIME | NULLABLE | 报名有效期 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.15 messages — 消息表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| receiver_id | VARCHAR(36) | NOT NULL, INDEX | 接收者 ID |
| receiver_type | ENUM('teacher','parent','admin') | NOT NULL | 接收者类型 |
| sender_id | VARCHAR(36) | NOT NULL | 发送者 ID |
| sender_type | ENUM('teacher','parent','admin','system') | NOT NULL | 发送者类型 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | TEXT | NOT NULL | 内容 |
| type | ENUM('system','task','parent') | NOT NULL, INDEX | 消息类型 |
| is_read | BOOLEAN | DEFAULT FALSE | 是否已读 |
| created_at | DATETIME | DEFAULT NOW() | |

INDEX: (receiver_id, receiver_type, is_read)

#### 3.2.16 teaching_materials — 教学资料表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| teacher_id | VARCHAR(36) | FK→teachers.id, INDEX | 上传教师 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| category | ENUM('courseware','lesson_plan','exercise','reference','other') | NOT NULL | 类别 |
| subject | VARCHAR(20) | | 科目 |
| description | TEXT | | 描述 |
| file_type | VARCHAR(10) | | 文件类型（pptx/docx/pdf等） |
| file_name | VARCHAR(200) | | 文件名 |
| file_size | BIGINT | | 文件大小（字节） |
| file_url | VARCHAR(500) | | 文件路径 |
| thumbnail | VARCHAR(500) | | 缩略图 |
| folder_id | VARCHAR(36) | FK→teaching_folders.id, NULLABLE | 所属文件夹 |
| is_shared | BOOLEAN | DEFAULT FALSE | 是否已分享 |
| download_count | INT | DEFAULT 0 | 下载次数 |
| tags | JSON | | 标签数组 |
| status | ENUM('active','inactive') | DEFAULT 'active' | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.17 teaching_folders — 资料文件夹表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| teacher_id | VARCHAR(36) | FK→teachers.id, INDEX | 所属教师 |
| name | VARCHAR(100) | NOT NULL | 文件夹名称 |
| subject | VARCHAR(20) | | 科目 |
| parent_id | VARCHAR(36) | FK→teaching_folders.id, NULLABLE | 父文件夹 |
| material_count | INT | DEFAULT 0 | 资料数量 |
| sort_order | INT | DEFAULT 0 | 排序 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.18 student_portfolios — 学生作品集表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| student_id | VARCHAR(36) | FK→students.id, INDEX | 学生 |
| class_id | VARCHAR(36) | FK→classes.id, INDEX | 班级 |
| teacher_id | VARCHAR(36) | FK→teachers.id | 添加教师 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| category | ENUM('artwork','essay','exam_paper','homework','competition','other') | NOT NULL | 类别 |
| description | TEXT | | 描述 |
| file_type | VARCHAR(10) | | 文件类型 |
| file_name | VARCHAR(200) | | 文件名 |
| file_size | BIGINT | | 文件大小 |
| file_url | VARCHAR(500) | | 文件路径 |
| thumbnail | VARCHAR(500) | | 缩略图 |
| is_featured | BOOLEAN | DEFAULT FALSE | 是否精选 |
| is_excellent | BOOLEAN | DEFAULT FALSE | 是否优秀 |
| tags | JSON | | 标签数组 |
| teacher_comment | TEXT | | 教师评语 |
| work_date | DATE | | 作品日期 |
| status | ENUM('active','inactive') | DEFAULT 'active' | 状态 |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | DEFAULT NOW() ON UPDATE | |

#### 3.2.19 material_class_shares — 资料-班级关联表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | VARCHAR(36) | PK | UUID |
| material_id | VARCHAR(36) | FK→teaching_materials.id, INDEX | 资料 |
| class_id | VARCHAR(36) | FK→classes.id, INDEX | 班级 |
| created_at | DATETIME | DEFAULT NOW() | |

UNIQUE 约束: (material_id, class_id)

---

## 4. API 接口设计

### 4.1 通用约定

**请求格式：** JSON，Header `Content-Type: application/json`

**认证方式：** Header `Authorization: Bearer <JWT_TOKEN>`

**统一响应格式：**（匹配前端 `api.js` 约定）

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

**错误响应：**

```json
{
  "code": 401,
  "message": "未授权，请先登录",
  "data": null
}
```

**分页响应 data 字段：**

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

**状态码约定：**

| code | 含义 |
|------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 4001 | 手机号已注册 |
| 4002 | 班级已满 |
| 4003 | 教师有活跃班级，不可删除 |
| 5001 | 微信登录失败 |

### 4.2 接口清单

#### 4.2.1 认证模块 `/api/v1/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/login` | 手机号+密码登录 | 否 |
| POST | `/auth/wx-login` | 微信登录 | 否 |
| POST | `/auth/refresh` | 刷新 Token | 是 |

**POST /auth/login 请求：**
```json
{
  "phone": "111",
  "password": "1234"
}
```

**POST /auth/login 响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 7200,
    "user_info": {
      "id": "admin001",
      "role": "admin",
      "name": "张校长",
      "avatar": "https://..."
    }
  }
}
```

**POST /auth/wx-login 请求：**
```json
{
  "code": "0a3xxx...",
  "phone": "13800138001"
}
```

#### 4.2.2 用户模块 `/api/v1/users`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/users` | 用户列表（分页） | admin |
| GET | `/users/me` | 当前用户详情 | 已登录 |
| GET | `/users/{id}` | 用户详情 | admin |
| POST | `/users` | 创建用户 | admin |
| PUT | `/users/{id}` | 更新用户 | admin |
| PUT | `/users/{id}/password` | 修改密码 | 本人/admin |
| DELETE | `/users/{id}` | 删除用户 | admin |

#### 4.2.3 教师模块 `/api/v1/teachers`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/teachers` | 教师列表（分页+筛选） | admin |
| GET | `/teachers/{id}` | 教师详情 | admin/本人 |
| POST | `/teachers` | 添加教师 | admin |
| PUT | `/teachers/{id}` | 更新教师 | admin |
| DELETE | `/teachers/{id}` | 删除教师 | admin |
| GET | `/teachers/{id}/classes` | 教师的班级列表 | admin/本人 |
| GET | `/teachers/{id}/students` | 教师的学生列表 | admin/本人 |
| GET | `/teachers/{id}/schedules` | 教师的排课 | admin/本人 |
| GET | `/teachers/{id}/attendances` | 教师的考勤记录 | admin/本人 |
| GET | `/teachers/{id}/assignments` | 教师的作业 | admin/本人 |
| GET | `/teachers/{id}/messages` | 教师的消息 | 本人 |
| GET | `/teachers/{id}/stats` | 教师统计数据 | admin/本人 |

#### 4.2.4 学生模块 `/api/v1/students`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/students` | 学生列表 | admin/teacher |
| GET | `/students/{id}` | 学生详情 | admin/teacher/家长 |
| POST | `/students` | 添加学生 | admin |
| PUT | `/students/{id}` | 更新学生 | admin |
| DELETE | `/students/{id}` | 删除学生 | admin |
| PUT | `/students/{id}/status` | 更新学生状态 | admin |
| GET | `/students/{id}/enrollments` | 学生的选课 | admin/家长 |
| GET | `/students/{id}/classes` | 学生的班级 | admin/家长 |
| GET | `/students/{id}/schedules` | 学生的排课 | admin/家长 |
| GET | `/students/{id}/homework` | 学生的作业 | admin/家长 |
| GET | `/students/{id}/attendances` | 学生的考勤 | admin/家长 |
| GET | `/students/{id}/grades` | 学生的成绩 | admin/家长 |
| GET | `/students/{id}/portfolio-summary` | 作品集概览 | admin/家长 |

#### 4.2.5 家长模块 `/api/v1/parents`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/parents` | 家长列表 | admin |
| GET | `/parents/{id}` | 家长详情 | admin/本人 |
| POST | `/parents` | 添加家长 | admin |
| PUT | `/parents/{id}` | 更新家长 | admin |
| GET | `/parents/{id}/students` | 家长的孩子列表 | admin/本人 |

#### 4.2.6 课程模块 `/api/v1/courses`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/courses` | 课程列表 | 所有角色 |
| GET | `/courses/{id}` | 课程详情 | 所有角色 |
| POST | `/courses` | 创建课程 | admin |
| PUT | `/courses/{id}` | 更新课程 | admin |
| DELETE | `/courses/{id}` | 删除课程 | admin |

#### 4.2.7 班级模块 `/api/v1/classes`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/classes` | 班级列表 | admin/teacher |
| GET | `/classes/{id}` | 班级详情 | admin/teacher |
| POST | `/classes` | 创建班级 | admin |
| PUT | `/classes/{id}` | 更新班级 | admin |
| DELETE | `/classes/{id}` | 删除班级 | admin |
| PUT | `/classes/{id}/status` | 更新班级状态 | admin |
| GET | `/classes/{id}/students` | 班级学生列表 | admin/teacher |
| GET | `/classes/{id}/schedules` | 班级排课 | admin/teacher |

#### 4.2.8 选课模块 `/api/v1/enrollments`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/enrollments` | 选课列表 | admin |
| POST | `/enrollments` | 学生选课 | admin |
| DELETE | `/enrollments/{id}` | 退选 | admin |

#### 4.2.9 排课模块 `/api/v1/schedules`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/schedules` | 排课列表（按日期/教师/班级筛选） | admin/teacher |
| GET | `/schedules/{id}` | 排课详情 | admin/teacher |
| POST | `/schedules` | 创建排课 | admin |
| PUT | `/schedules/{id}` | 更新排课 | admin |
| DELETE | `/schedules/{id}` | 删除排课 | admin |

#### 4.2.10 考勤模块 `/api/v1/attendances`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/attendances` | 考勤列表 | admin/teacher |
| POST | `/attendances` | 单条签到 | admin/teacher |
| POST | `/attendances/batch` | 批量签到 | admin/teacher |

#### 4.2.11 成绩模块 `/api/v1/grades`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/grades` | 成绩列表 | admin/teacher |
| POST | `/grades` | 录入成绩 | admin/teacher |

#### 4.2.12 作业模块 `/api/v1/assignments`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/assignments` | 作业列表 | admin/teacher |
| GET | `/assignments/{id}` | 作业详情 | admin/teacher |
| POST | `/assignments` | 发布作业 | admin/teacher |
| PUT | `/assignments/{id}` | 更新作业 | admin/teacher |

#### 4.2.13 作业提交模块 `/api/v1/submissions`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/submissions` | 提交作业 | admin/家长 |
| PUT | `/submissions/{id}/grade` | 批改作业 | admin/teacher |

#### 4.2.14 公告模块 `/api/v1/announcements`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/announcements` | 公告列表 | 所有角色 |
| GET | `/announcements/{id}` | 公告详情 | 所有角色 |
| POST | `/announcements` | 发布公告 | admin |
| PUT | `/announcements/{id}` | 更新公告 | admin |
| DELETE | `/announcements/{id}` | 删除公告 | admin |
| PUT | `/announcements/{id}/pin` | 置顶/取消置顶 | admin |

#### 4.2.15 报名模块 `/api/v1/registrations`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/registrations` | 报名列表 | admin |
| GET | `/registrations/{id}` | 报名详情 | admin |
| POST | `/registrations` | 提交报名 | 无需认证 |
| PUT | `/registrations/{id}/status` | 审批/状态变更 | admin |
| GET | `/registrations/phone/{phone}` | 按手机号查询 | admin |
| GET | `/registrations/stats` | 报名统计 | admin |

#### 4.2.16 消息模块 `/api/v1/messages`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/messages` | 消息列表 | 已登录 |
| PUT | `/messages/{id}/read` | 标记已读 | 已登录 |
| PUT | `/messages/read-all` | 全部标记已读 | 已登录 |

#### 4.2.17 教学资料模块 `/api/v1/materials`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/materials` | 资料列表 | admin/teacher |
| GET | `/materials/{id}` | 资料详情 | admin/teacher |
| POST | `/materials` | 上传资料 | admin/teacher |
| PUT | `/materials/{id}` | 更新资料 | admin/teacher |
| DELETE | `/materials/{id}` | 删除资料 | admin/teacher |
| POST | `/materials/{id}/share/{class_id}` | 分享到班级 | admin/teacher |
| DELETE | `/materials/{id}/share/{class_id}` | 取消分享 | admin/teacher |
| GET | `/materials/shared-with/{class_id}` | 班级共享资料 | admin/teacher/家长 |
| POST | `/materials/upload` | 文件上传 | admin/teacher |

#### 4.2.18 资料文件夹模块 `/api/v1/folders`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/folders` | 文件夹列表 | admin/teacher |
| POST | `/folders` | 创建文件夹 | admin/teacher |
| PUT | `/folders/{id}` | 更新文件夹 | admin/teacher |
| DELETE | `/folders/{id}` | 删除文件夹 | admin/teacher |

#### 4.2.19 学生作品集模块 `/api/v1/portfolios`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/portfolios` | 作品列表 | admin/teacher/家长 |
| GET | `/portfolios/{id}` | 作品详情 | admin/teacher/家长 |
| POST | `/portfolios` | 添加作品 | admin/teacher |
| PUT | `/portfolios/{id}` | 更新作品 | admin/teacher |
| DELETE | `/portfolios/{id}` | 删除作品 | admin/teacher |
| PUT | `/portfolios/{id}/toggle-featured` | 切换精选 | admin/teacher |
| PUT | `/portfolios/{id}/toggle-excellent` | 切换优秀 | admin/teacher |
| GET | `/portfolios/timeline/{student_id}` | 学生作品时间线 | admin/家长 |
| POST | `/portfolios/upload` | 图片上传 | admin/teacher |

#### 4.2.20 统计模块 `/api/v1/stats`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/stats/admin` | 管理员统计数据 | admin |
| GET | `/stats/teacher/{id}` | 教师统计数据 | admin/本人 |

---

## 5. 认证方案

### 5.1 登录流程

```
方式一：手机号+密码登录
┌────────┐    POST /auth/login     ┌──────────┐
│ 小程序  │ ──── {phone,password} ──►│  后端    │
│        │                         │          │
│        │◄──── {token,user_info} ──│          │
└────────┘                         └──────────┘

方式二：微信登录
┌────────┐                         ┌──────────┐     ┌──────────┐
│ 小程序  │  1. wx.login() → code  │  后端    │     │   微信   │
│        │ ──── POST /auth/wx-login│          │     │   API    │
│        │     {code, phone?}      │          │     │          │
│        │                         │ 2.调用──►│code2session│
│        │                         │          │────►│          │
│        │                         │          │◄────│ {openid} │
│        │                         │          │     └──────────┘
│        │                         │ 3.查找/  │
│        │                         │   创建用户│
│        │◄──── {token,user_info} ──│          │
└────────┘                         └──────────┘
```

### 5.2 JWT Token 结构

**Access Token（2小时有效）：**
```json
{
  "sub": "teacher001",
  "role": "teacher",
  "type": "access",
  "exp": 1716720000
}
```

**Refresh Token（7天有效）：**
```json
{
  "sub": "teacher001",
  "role": "teacher",
  "type": "refresh",
  "exp": 1717324800
}
```

### 5.3 权限矩阵

| 接口模块 | admin | teacher | parent |
|----------|-------|---------|--------|
| 用户管理 | 全部 | 本人 | 本人 |
| 教师管理 | 全部 | 本人 | - |
| 学生管理 | 全部 | 所教学生 | 自己的孩子 |
| 班级管理 | 全部 | 所教班级 | 孩子班级（只读） |
| 排课管理 | 全部 | 本人排课 | 孩子排课（只读） |
| 考勤管理 | 全部 | 所教班级 | 孩子考勤（只读） |
| 成绩管理 | 全部 | 所教班级 | 孩子成绩（只读） |
| 作业管理 | 全部 | 所教班级 | 孩子作业（只读） |
| 教学资料 | 全部 | 本人+共享 | 共享资料（只读） |
| 报名管理 | 全部 | - | - |
| 公告管理 | 全部 | - | 只读 |
| 统计数据 | 全部 | 本人 | - |

---

## 6. 关键业务规则

### 6.1 报名审批级联操作

报名状态从 `admitted` 变为 `enrolled` 时，需在一个事务中完成以下级联操作：

```
审批通过 (admitted → enrolled)
    ├── 1. 创建 User 账号（role=parent, phone=报名手机号）
    ├── 2. 创建 Parent 记录（关联 User）
    ├── 3. 创建 Student 记录（关联 Parent）
    ├── 4. 创建 Enrollment 记录（关联 Student + Class）
    └── 5. 更新 Registration（关联 user_id, class_id）
```

### 6.2 教师删除约束

- 有活跃班级的教师不可删除，返回错误码 4003

### 6.3 班级容量校验

- 选课时检查班级当前人数 < capacity，否则返回错误码 4002

### 6.4 文件夹删除约束

- 有资料的文件夹不可删除，需先移出或删除资料

### 6.5 软删除策略

- 含 `status` 字段的实体使用软删除（status → inactive），而非物理删除
- 列表查询默认过滤 status=inactive 的记录

---

## 7. 项目目录结构

```
backend/
├── alembic/                          # 数据库迁移
│   ├── versions/                     # 迁移脚本
│   ├── env.py
│   └── script.py.mako
├── alembic.ini
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI 入口
│   │
│   ├── config/                       # 配置层
│   │   ├── __init__.py
│   │   ├── settings.py               # 从 YAML 加载配置，Pydantic 模型校验
│   │   ├── database.py               # SQLAlchemy 引擎 + SessionLocal
│   │   └── logging_conf.py           # 日志配置
│   │
│   ├── configs/                      # YAML 配置文件目录
│   │   ├── application.yml           # 公共配置（所有环境共享）
│   │   ├── application-dev.yml       # 开发环境配置
│   │   ├── application-test.yml      # 测试环境配置
│   │   └── application-prod.yml      # 生产环境配置
│   │
│   ├── models/                       # Model 层（ORM 实体）
│   │   ├── __init__.py               # 导出所有模型
│   │   ├── base.py                   # DeclarativeBase + BaseMixin
│   │   ├── user.py                   # 18个实体模型...
│   │   └── ...
│   │
│   ├── schemas/                      # DTO 层（Pydantic 模型）
│   │   ├── __init__.py
│   │   ├── base.py                   # APIResponse、PaginatedData、PaginationParams
│   │   ├── auth.py                   # 登录请求/响应
│   │   ├── user.py                   # 每个实体的 Create/Update/Out...
│   │   └── ...
│   │
│   ├── repositories/                 # DAO 层（数据访问）
│   │   ├── __init__.py
│   │   ├── base.py                   # BaseRepository[T] 泛型基类
│   │   ├── user.py                   # 各实体 Repository...
│   │   └── ...
│   │
│   ├── services/                     # Service 层（业务逻辑）
│   │   ├── __init__.py
│   │   ├── auth.py                   # 认证服务
│   │   ├── user.py                   # 各实体 Service...
│   │   ├── stats.py                  # 统计聚合服务
│   │   └── ...
│   │
│   ├── routers/                      # Controller 层（API 路由）
│   │   ├── __init__.py
│   │   ├── auth.py                   # 认证路由
│   │   ├── user.py                   # 各实体路由...
│   │   └── ...
│   │
│   ├── dependencies/                 # 依赖注入
│   │   ├── __init__.py
│   │   ├── db.py                     # get_db
│   │   ├── auth.py                   # get_current_user, require_role
│   │   └── pagination.py             # PaginationParams
│   │
│   ├── middleware/                   # 中间件
│   │   ├── __init__.py
│   │   ├── cors.py                   # CORS
│   │   ├── error_handler.py          # 全局异常处理
│   │   └── request_log.py            # 请求日志
│   │
│   ├── exceptions/                   # 自定义异常
│   │   ├── __init__.py
│   │   └── base.py                   # AppException 体系
│   │
│   └── utils/                        # 工具函数
│       ├── __init__.py
│       ├── security.py               # JWT + 密码
│       ├── wechat.py                 # 微信 API
│       ├── file_upload.py            # 文件上传
│       └── helpers.py                # 通用工具
│
├── scripts/
│   ├── init_db.py                    # 建表
│   └── seed_data.py                  # 种子数据
│
├── tests/                            # 测试
│   ├── conftest.py
│   └── test_*.py
│
├── Dockerfile
├── docker-compose.yml                # App + MySQL + Redis
├── requirements.txt
├── .env                              # 仅存放 APP_ENV 等少量环境变量
├── .env.example
└── .gitignore
```

---

## 8. 部署架构

```
┌──────────────────────────────────────────────────┐
│                 Docker Compose                    │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  FastAPI   │  │   MySQL    │  │   Redis    │ │
│  │  :8000     │  │   :3306    │  │   :6379    │ │
│  │            │──│            │  │            │ │
│  │ Uvicorn    │  │ MySQL 8.0  │  │ Redis 7   │ │
│  │ 4 workers  │  │ utf8mb4   │  │            │ │
│  └─────┬──────┘  └────────────┘  └────────────┘ │
│        │                                         │
└────────┼─────────────────────────────────────────┘
         │
    Nginx 反向代理 (HTTPS)
         │
    微信小程序 (wx.request)
```

**配置方式：** 采用 YAML 配置文件 + Profile 机制（类似 Spring Boot），详见第 10 章。

---

## 9. 技术依赖

```
# requirements.txt
fastapi==0.115.*
uvicorn[standard]==0.32.*
sqlalchemy[asyncio]==2.0.*
aiomysql==0.2.*
alembic==1.14.*
pydantic==2.10.*
pydantic-settings==2.6.*
pyyaml==6.0.*
python-jose[cryptography]==3.3.*
passlib[bcrypt]==1.7.*
httpx==0.28.*
python-multipart==0.0.18
redis==5.*
pytest==8.*
pytest-asyncio==0.24.*
```

---

## 10. 配置管理方案

### 10.1 设计思路

参照 Spring Boot 的 `application.yml` + Profile 机制，所有配置集中到 YAML 文件，按环境隔离。运行时通过 `APP_ENV` 环境变量激活对应 Profile，合并加载公共配置 + 环境配置。

```
┌─────────────────────────────────────────────────────────┐
│                   配置加载流程                           │
│                                                         │
│  APP_ENV=dev (环境变量)                                  │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────┐     ┌──────────────────┐             │
│  │application.yml│ ──► │ 深度合并          │             │
│  │ (公共配置)    │     │ (profile 覆盖)    │             │
│  └──────────────┘     └────────┬─────────┘             │
│                                │                        │
│  ┌──────────────────┐          │                        │
│  │application-dev.yml│ ───────►│                        │
│  │ (开发环境覆盖)    │          │                        │
│  └──────────────────┘          ▼                        │
│                        ┌───────────────┐                │
│  环境变量覆盖 ────────►│ Settings 对象  │                │
│  (最高优先级)          │ (Pydantic 校验)│                │
│                        └───────────────┘                │
│                                │                        │
│                                ▼                        │
│                    全局单例，供各层引用                    │
└─────────────────────────────────────────────────────────┘
```

**优先级（从低到高）：**

1. `application.yml` — 公共默认值
2. `application-{profile}.yml` — 环境特定覆盖
3. 环境变量 — 最高优先级（敏感信息如密码、密钥）

### 10.2 配置文件目录结构

```
backend/
├── app/
│   └── config/
│       ├── __init__.py
│       ├── settings.py          # 配置加载 + Pydantic 模型定义
│       ├── database.py          # 引擎创建（从 settings 读取）
│       └── logging_conf.py      # 日志配置
│
├── configs/                     # YAML 配置文件（随项目版本管理）
│   ├── application.yml          # 公共配置
│   ├── application-dev.yml      # 开发环境
│   ├── application-test.yml     # 测试环境
│   └── application-prod.yml     # 生产环境
│
├── .env                         # 仅存放 APP_ENV + 敏感覆盖（不入 Git）
└── .env.example                 # .env 模板（入 Git）
```

### 10.3 YAML 配置文件内容

#### application.yml（公共配置）

```yaml
# ==================== 应用配置 ====================
app:
  name: 培训中心管理系统
  version: 1.0.0
  api_prefix: /api/v1
  debug: false

# ==================== 服务器配置 ====================
server:
  host: 0.0.0.0
  port: 8000
  workers: 4
  reload: false

# ==================== 数据库配置 ====================
database:
  driver: mysql+aiomysql
  host: 127.0.0.1
  port: 3306
  name: edutrain
  user: edutrain
  password: ""              # 生产环境由 profile 或环境变量覆盖
  pool_size: 20
  max_overflow: 10
  pool_recycle: 3600
  echo: false               # SQL 日志，开发环境可开启

# ==================== Redis 配置 ====================
redis:
  host: 127.0.0.1
  port: 6379
  db: 0
  password: ""
  pool_size: 10

# ==================== JWT 认证配置 ====================
jwt:
  secret_key: ""            # 必须由 profile 或环境变量覆盖
  algorithm: HS256
  access_token_expire_minutes: 120
  refresh_token_expire_days: 7

# ==================== 微信小程序配置 ====================
wechat:
  appid: ""
  secret: ""

# ==================== 文件上传配置 ====================
upload:
  dir: ./uploads
  max_size: 52428800        # 50MB
  allowed_extensions:
    - jpg
    - jpeg
    - png
    - gif
    - mp4
    - pdf
    - docx
    - pptx
    - xlsx

# ==================== 日志配置 ====================
logging:
  level: INFO
  format: "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
  file: ./logs/app.log
  max_bytes: 10485760       # 10MB
  backup_count: 5

# ==================== CORS 配置 ====================
cors:
  allow_origins:
    - "*"
  allow_methods:
    - GET
    - POST
    - PUT
    - DELETE
  allow_headers:
    - "*"

# ==================== 分页配置 ====================
pagination:
  default_page_size: 20
  max_page_size: 100
```

#### application-dev.yml（开发环境）

```yaml
app:
  debug: true

server:
  reload: true
  workers: 1

database:
  host: 127.0.0.1
  port: 3306
  name: edutrain_dev
  user: edutrain
  password: edutrain123
  echo: true                # 开发环境打印 SQL

redis:
  host: 127.0.0.1
  port: 6379

jwt:
  secret_key: dev-secret-key-do-not-use-in-production
  access_token_expire_minutes: 480    # 开发环境 8 小时

logging:
  level: DEBUG
  file: ./logs/app-dev.log
```

#### application-test.yml（测试环境）

```yaml
app:
  debug: true

server:
  host: 0.0.0.0
  port: 8001

database:
  host: 127.0.0.1
  name: edutrain_test
  user: edutrain
  password: edutrain_test_123
  echo: false

jwt:
  secret_key: test-secret-key
  access_token_expire_minutes: 30

logging:
  level: DEBUG
```

#### application-prod.yml（生产环境）

```yaml
app:
  debug: false

server:
  workers: 4

database:
  host: db                  # Docker Compose 服务名
  name: edutrain
  pool_size: 30
  max_overflow: 20
  echo: false

redis:
  host: redis               # Docker Compose 服务名

cors:
  allow_origins:
    - https://your-domain.com

logging:
  level: WARNING
  file: /var/log/edutrain/app.log
  max_bytes: 52428800       # 50MB
  backup_count: 30
```

### 10.4 .env 文件（敏感信息）

`.env` 仅存放环境标识和必须覆盖的敏感配置，不入 Git：

```bash
# 激活的配置 Profile: dev / test / prod
APP_ENV=dev

# 敏感信息覆盖（优先级最高）
DATABASE_PASSWORD=edutrain123
JWT_SECRET_KEY=dev-secret-key-do-not-use-in-production
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-secret-here
REDIS_PASSWORD=
```

`.env.example`（模板，入 Git）：

```bash
APP_ENV=dev
DATABASE_PASSWORD=
JWT_SECRET_KEY=
WECHAT_APPID=
WECHAT_SECRET=
REDIS_PASSWORD=
```

### 10.5 settings.py 配置加载实现

```python
# app/config/settings.py

import os
from pathlib import Path
from typing import Optional
import yaml
from pydantic import Field
from pydantic_settings import BaseSettings


# ────────────────────── Pydantic 配置模型 ──────────────────────

class AppConfig(BaseSettings):
    name: str = "培训中心管理系统"
    version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    debug: bool = False


class ServerConfig(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    reload: bool = False


class DatabaseConfig(BaseSettings):
    driver: str = "mysql+aiomysql"
    host: str = "127.0.0.1"
    port: int = 3306
    name: str = "edutrain"
    user: str = "edutrain"
    password: str = ""
    pool_size: int = 20
    max_overflow: int = 10
    pool_recycle: int = 3600
    echo: bool = False

    @property
    def url(self) -> str:
        return f"{self.driver}://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


class RedisConfig(BaseSettings):
    host: str = "127.0.0.1"
    port: int = 6379
    db: int = 0
    password: str = ""
    pool_size: int = 10

    @property
    def url(self) -> str:
        auth = f":{self.password}@" if self.password else ""
        return f"redis://{auth}{self.host}:{self.port}/{self.db}"


class JWTConfig(BaseSettings):
    secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    refresh_token_expire_days: int = 7


class WeChatConfig(BaseSettings):
    appid: str = ""
    secret: str = ""


class UploadConfig(BaseSettings):
    dir: str = "./uploads"
    max_size: int = 52428800
    allowed_extensions: list[str] = Field(default_factory=lambda: [
        "jpg", "jpeg", "png", "gif", "mp4", "pdf", "docx", "pptx", "xlsx"
    ])


class LoggingConfig(BaseSettings):
    level: str = "INFO"
    format: str = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    file: Optional[str] = "./logs/app.log"
    max_bytes: int = 10485760
    backup_count: int = 5


class CORSConfig(BaseSettings):
    allow_origins: list[str] = Field(default_factory=lambda: ["*"])
    allow_methods: list[str] = Field(default_factory=lambda: ["GET", "POST", "PUT", "DELETE"])
    allow_headers: list[str] = Field(default_factory=lambda: ["*"])


class PaginationConfig(BaseSettings):
    default_page_size: int = 20
    max_page_size: int = 100


class Settings(BaseSettings):
    app: AppConfig = AppConfig()
    server: ServerConfig = ServerConfig()
    database: DatabaseConfig = DatabaseConfig()
    redis: RedisConfig = RedisConfig()
    jwt: JWTConfig = JWTConfig()
    wechat: WeChatConfig = WeChatConfig()
    upload: UploadConfig = UploadConfig()
    logging: LoggingConfig = LoggingConfig()
    cors: CORSConfig = CORSConfig()
    pagination: PaginationConfig = PaginationConfig()


# ────────────────────── YAML 加载逻辑 ──────────────────────

def _deep_merge(base: dict, override: dict) -> dict:
    """深度合并两个字典，override 的值覆盖 base 的值"""
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def _load_yaml(path: Path) -> dict:
    """加载单个 YAML 文件"""
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def _apply_env_overrides(raw: dict) -> dict:
    """
    环境变量覆盖 YAML 配置（最高优先级）。
    支持格式: DATABASE_PASSWORD → database.password
    """
    env_mapping = {
        "DATABASE_PASSWORD": ("database", "password"),
        "JWT_SECRET_KEY": ("jwt", "secret_key"),
        "WECHAT_APPID": ("wechat", "appid"),
        "WECHAT_SECRET": ("wechat", "secret"),
        "REDIS_PASSWORD": ("redis", "password"),
        "DATABASE_HOST": ("database", "host"),
        "DATABASE_PORT": ("database", "port"),
        "DATABASE_NAME": ("database", "name"),
        "DATABASE_USER": ("database", "user"),
    }
    for env_key, path in env_mapping.items():
        value = os.getenv(env_key)
        if value is not None:
            section, key = path
            raw.setdefault(section, {})[key] = value
    return raw


def load_settings() -> Settings:
    """
    加载配置：application.yml → application-{profile}.yml → 环境变量覆盖
    """
    config_dir = Path(__file__).resolve().parent.parent.parent / "configs"
    profile = os.getenv("APP_ENV", "dev")

    # 1. 加载公共配置
    base_config = _load_yaml(config_dir / "application.yml")

    # 2. 加载 Profile 配置并深度合并
    profile_config = _load_yaml(config_dir / f"application-{profile}.yml")
    merged = _deep_merge(base_config, profile_config)

    # 3. 环境变量覆盖
    merged = _apply_env_overrides(merged)

    # 4. Pydantic 校验
    return Settings(**merged)


# ────────────────────── 全局单例 ──────────────────────

settings = load_settings()
```

### 10.6 各模块引用配置

```python
# app/config/database.py
from app.config.settings import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    settings.database.url,
    pool_size=settings.database.pool_size,
    max_overflow=settings.database.max_overflow,
    pool_recycle=settings.database.pool_recycle,
    echo=settings.database.echo,
)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# app/main.py
from app.config.settings import settings

app = FastAPI(
    title=settings.app.name,
    version=settings.app.version,
    debug=settings.app.debug,
)


# app/utils/security.py
from app.config.settings import settings

def create_access_token(subject: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=settings.jwt.access_token_expire_minutes
    )
    payload = {"sub": subject, "role": role, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.jwt.secret_key, algorithm=settings.jwt.algorithm)
```

### 10.7 Alembic 配置对接

```ini
# alembic.ini — 仅保留模板引用，实际 URL 从 settings 读取
[alembic]
script_location = alembic
# sqlalchemy.url 不写死，由 env.py 动态注入
```

```python
# alembic/env.py
import sys
from pathlib import Path

# 将项目根目录加入 sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config.settings import settings

config.set_main_option("sqlalchemy.url", settings.database.url)
```

### 10.8 Docker Compose 环境变量注入

```yaml
# docker-compose.yml
services:
  api:
    environment:
      - APP_ENV=prod
      - DATABASE_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET_KEY=${JWT_SECRET}
      - WECHAT_APPID=${WX_APPID}
      - WECHAT_SECRET=${WX_SECRET}
```

Docker 部署时，`APP_ENV=prod` 激活 `application-prod.yml`，敏感信息通过 Docker 环境变量注入（最高优先级覆盖）。

### 10.9 与 Spring Boot 对照

| Spring Boot | 本项目 | 说明 |
|-------------|--------|------|
| `application.yml` | `configs/application.yml` | 公共默认配置 |
| `application-dev.yml` | `configs/application-dev.yml` | 开发环境覆盖 |
| `application-prod.yml` | `configs/application-prod.yml` | 生产环境覆盖 |
| `spring.profiles.active` | `APP_ENV` 环境变量 | 激活哪个 Profile |
| `@Value("${db.host}")` | `settings.database.host` | 读取配置值 |
| `@ConfigurationProperties` | `DatabaseConfig(BaseSettings)` | 配置分组绑定 |
| `PropertySource` 优先级 | YAML → Profile → 环境变量 | 相同的覆盖逻辑 |
| `configtree:` | `_deep_merge()` | 深度合并实现 |
