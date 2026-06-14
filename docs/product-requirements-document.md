# EduTrain 产品需求文档（PRD）

> 版本: v2.0 | 更新日期: 2026-06-02 | 状态: 规划中

---

## 一、产品定位

### 1.1 一句话定义

EduTrain 是面向线下培训机构的数字化基础设施，通过提升家长满意度和口碑传播，帮助机构获得更多生源。

### 1.2 不是什么

- 不是一个 SaaS 变现产品
- 不是纯管理工具（管理是手段，招生是目的）
- 不是替代微信群的沟通工具

### 1.3 核心价值链

```
数字化便利
    ↓
家长满意度提升（被重视感、参与感、成长可见）
    ↓
家长主动口碑传播（朋友圈分享、口头推荐）
    ↓
新学员咨询和报名
    ↓
机构生源增长 → 更愿意使用 → 飞轮加速
```

### 1.4 成功标准

| 北极星指标 | 定义 | 目标值 |
|-----------|------|--------|
| 家长月度分享次数 | 每月家长通过小程序分享成长报告/作品到微信的次数 | ≥ 家长数的 30%/月 |
| 试听→报名转化率 | 试听体验课后正式报名的比例 | ≥ 40% |
| 推荐新生源占比 | 通过家长推荐来的新学员占总新学员比例 | ≥ 25% |
| 教师周均发布数 | 教师每周发布作品/评价/作业的条数 | ≥ 3 条/周 |

---

## 二、用户画像与核心场景

### 2.1 家长

**画像：** 30-45岁，关注孩子学习，但工作忙，无法全程陪伴。选择培训机构靠朋友推荐。

**核心情绪：** "我想知道孩子学得怎么样" → "哇，孩子进步了！" → "我要告诉别人"

| 场景 | 当前痛点 | 期望体验 |
|------|---------|---------|
| 了解孩子学习 | 只能问孩子或等家长会，信息滞后 | 随时看到有温度的成长总结 |
| 感受孩子进步 | 只看分数，没有趋势和对比 | 看到进步曲线，收到进步祝贺 |
| 分享孩子成果 | 只能拍照片发朋友圈，没有品牌感 | 一键生成带机构 logo 的精美卡片 |
| 推荐给朋友 | 口头说几句，朋友记不住 | 转发链接，朋友直接看机构介绍和预约试听 |
| 报名课程 | 到店咨询，流程繁琐 | 手机上完成咨询→试听→报名 |

### 2.2 教师

**画像：** 25-40岁，兼职或全职，上课为主，反感繁琐的行政操作。

**核心情绪：** "我不想花太多时间在手机上做管理" → "如果很简单我就用"

| 场景 | 当前痛点 | 期望体验 |
|------|---------|---------|
| 课前准备 | 忘记上课时间，临时找教室 | 提前收到提醒，一眼看清今日安排 |
| 课堂签到 | 逐个点名，费时 | 拍照一键完成考勤 |
| 记录学生成果 | 拍了照片但懒得整理归档 | 拍照自动归入学生档案 |
| 发布作业 | 每次重复写类似内容 | 作业模板一键发布 |
| 反馈家长 | 沟通零散，家长记不住 | 结构化评语自动推送给家长 |

### 2.3 管理员（校长/教务）

**画像：** 35-50岁，最关心招生和续费，其次才是管理效率。

**核心情绪：** "我需要更多学员" → "这个工具能帮我招到人吗"

| 场景 | 当前痛点 | 期望体验 |
|------|---------|---------|
| 招生 | 靠发传单和老带新，效率低 | 家长主动分享带来新线索 |
| 续费 | 不知道谁快到期，被动等待 | 自动提醒续费，数据支撑沟通 |
| 了解口碑 | 不知道家长满不满意 | NPS 脉搏实时监测 |
| 生源来源 | 不知道哪个渠道来的学生多 | 每个学员标记来源，统计转化率 |
| 报名处理 | 手动登记，容易遗漏 | 在线报名→审批→自动建档 |

---

## 三、产品策略：从"管理工具"到"招生武器"

### 3.1 策略转型

| 维度 | 旧思路 | 新思路 |
|------|--------|--------|
| 产品重心 | 管理效率（给管理员用） | 口碑+招生（让家长主动传播） |
| 核心功能 | 数据管理（增删改查） | 内容生产+分享（成长报告、作品展示） |
| 价值感知 | 管理员觉得好用 | 家长觉得"被重视" |
| 增长方式 | 机构采购 | 家长口碑裂变 |
| 体验设计 | 功能全面 | 核心路径极简 |

### 3.2 功能分级原则

**A 级（驱动口碑和招生）：** 必须做到极致，是产品存在的理由
**B 级（让核心流程跑通）：** 够用即可，不追求完美
**C 级（锦上添花）：** 后续迭代，不影响核心价值

---

## 四、功能需求

### 4.1 A 级功能：口碑驱动

#### 4.1.1 成长周报/月报

**目标：** 让家长定期收到有温度的孩子成长总结，激发分享欲

**需求描述：**

- 系统自动汇总每周/月数据，生成成长报告
- 报告内容：出勤、作业完成率、成绩趋势、教师评语、优秀作品
- 报告风格：温暖、鼓励性，不是冷冰冰的数据表
- 支持一键生成精美分享卡片（带机构 logo 和品牌色）
- 支持分享到微信好友/朋友圈
- 教师可编辑评语后再发送

**页面：** 新增 `pages/growth-report/growth-report`

**数据来源：** 考勤、成绩、作业提交、作品集 → 自动汇总

**分享卡片示例：**

```
┌──────────────────────────┐
│  [机构Logo] 星程培训中心   │
│                          │
│  小明同学 · 本周成长报告    │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│  📈 数学进步 8分 ↑         │
│  ✅ 出勤 3/3 全勤          │
│  📝 作业完成 100%          │
│  ⭐ 优秀作品 [缩略图]      │
│                          │
│  王老师：小明本周在导数…    │
│                          │
│  [分享给朋友] [查看详情]   │
│  ━━━━━━━━━━━━━━━━━━━━━━  │
│  长按了解 [机构名] 课程    │
└──────────────────────────┘
```

#### 4.1.2 作品集品牌化展示与分享

**目标：** 家长的骄傲感 → 分享 → 机构品牌曝光

**需求描述：**

- 作品详情页增加"生成分享卡片"按钮
- 卡片包含：作品照片 + 学生姓名(可脱敏) + 教师评语 + 机构品牌
- 机构可在后台配置品牌水印样式（logo位置、品牌色、标语）
- 分享卡片嵌入小程序码，扫码可进入机构展示页
- 家长可选择是否在卡片上显示孩子姓名

**影响页面：** `pages/parent-portfolio-detail`、`pages/teacher-portfolio-detail`

#### 4.1.3 进步通知推送

**目标：** 主动触达家长，创造"被重视"的惊喜感

**需求描述：**

- 触发场景：
  - 成绩进步超过10分
  - 连续3次作业满分
  - 作品被标记为"优秀"
  - 本月全勤
- 通知形式：微信服务通知（template message）
- 通知文案模板（可配置）：
  - "🎉 小明本周数学作业92分，进步8分！继续加油！"
  - "⭐ 小明的作文被王老师评为优秀作品！"
- 通知内可一键查看详情或分享

**新增接口：** `POST /notifications/progress`（触发进步通知）

#### 4.1.4 推荐裂变机制

**目标：** 将家长满意度转化为实际的新生源

**需求描述：**

- 家长端增加"推荐好友"入口
- 生成专属推荐码/链接
- 好友通过链接报名试听 → 推荐人获得奖励（如1节免费课）
- 机构可配置奖励规则
- 管理员可查看推荐关系链和转化数据

**新增页面：** `pages/invite/invite`（推荐页）

**新增数据模型：**

```
referrals:
  id, referrer_parent_id, invitee_phone, invitee_name,
  status(pending/trial/enrolled), reward_claimed,
  created_at
```

**新增接口：**
- `POST /referrals`（创建推荐记录）
- `GET /referrals/mine`（我的推荐记录）
- `GET /referrals/stats`（推荐统计-管理员）

#### 4.1.5 机构品牌展示页

**目标：** 给机构一个可分享的、有说服力的招生页面

**需求描述：**

- 机构信息展示：名称、简介、师资、课程、学员成果
- 精选作品展示（来自作品集的优秀作品）
- 学员/家长真实评价
- 一键预约试听（填写手机号即可）
- 页面可被分享到微信，扫码直接打开
- 管理员可编辑品牌页内容

**新增页面：** `pages/school-home/school-home`（对外展示页，无需登录可访问）

**新增数据模型：**

```
school_profiles:
  id, name, logo, banner, description, features[],
  photos[], contact_phone, address, business_hours,
  updated_at
```

#### 4.1.6 试听体验报告

**目标：** 提升试听→报名转化率

**需求描述：**

- 试听课后，教师为试听学员填写体验报告
- 报告内容：课堂表现、兴趣评估、能力分析、推荐课程方案
- 报告以精美卡片形式推送给家长
- 包含限时优惠信息（可配置）
- 家长可在报告页直接确认报名

**新增页面：** `pages/trial-report/trial-report`

**新增数据模型：**

```
trial_reports:
  id, student_name, parent_phone, class_id, teacher_id,
  performance, interest, ability_analysis,
  recommended_course_id, valid_until, discount_info,
  status(draft/sent/confirmed/expired), created_at
```

---

### 4.2 B 级功能：核心流程支撑

#### 4.2.1 教师极简操作

**目标：** 教师每周操作时间 ≤ 15分钟

**改进项：**

| 功能 | 当前问题 | 改进方案 |
|------|---------|---------|
| 考勤 | 多步操作，需选学生+状态 | **拍照签到：** 拍一张课堂照片 → 自动识别班级 → 一键标记全勤，缺勤单独勾选 |
| 作品归档 | 上传流程5步以上 | **拍照即归档：** 拍照 → 选学生 → 完成（班级、课程、日期自动填充） |
| 作业发布 | 每次手动填写 | **作业模板：** 保存常用作业为模板，一键发布，只需改截止日期 |
| 课堂提醒 | 无 | 上课前30分钟自动推送提醒，包含教室、学生数、上节课未交作业名单 |

**影响页面：** `teacher-schedule`、`teacher-portfolio-add`、`teacher-homework`

**新增接口：**
- `POST /attendances/quick`（快速签到：班级+日期+缺勤名单）
- `GET /assignments/templates`（作业模板列表）
- `POST /assignments/from-template`（从模板创建作业）

#### 4.2.2 续费提醒

**目标：** 主动提醒即将到期学员，提升续费率

**需求描述：**

- 班级设置"课程期数"和"到期日期"
- 到期前2周、1周、3天自动提醒管理员
- 管理员可一键发送续费邀请给家长
- 家长端显示续费倒计时和续费入口

**影响页面：** `admin-class-detail`、`admin-index`、`parent-index`

**新增接口：**
- `GET /renewals/upcoming`（即将到期列表）
- `POST /renewals/remind`（发送续费提醒）

#### 4.2.3 生源来源追踪

**目标：** 机构知道哪个渠道来的学生最多，优化招生策略

**需求描述：**

- 报名时标记来源：朋友推荐/地推/线上广告/自然到店/其他
- 推荐来源自动关联推荐人
- 管理员可查看来源分布统计
- 按来源看转化率

**影响页面：** `admin-enrollments`、`enrollment`

**新增字段：** `registrations.source`（来源标记）

**新增接口：** `GET /stats/source-distribution`（来源分布统计）

#### 4.2.4 家长满意度脉搏

**目标：** 机构实时了解家长满意度，及时干预

**需求描述：**

- 每月自动推送一条简短满意度调查（1个问题：0-10分推荐意愿）
- 计算NPS分数
- 低分家长自动提醒管理员跟进
- 管理员看NPS趋势

**新增页面：** `pages/nps-survey/nps-survey`（1题调查页）

**新增数据模型：**

```
nps_surveys:
  id, parent_id, score(0-10), comment, period(月度),
  created_at
```

**新增接口：**
- `POST /nps`（提交NPS评分）
- `GET /nps/current`（当前期调查）
- `GET /stats/nps`（NPS统计）

---

### 4.3 C 级功能：后续迭代

以下功能在 A/B 级功能验证口碑链路后再逐步加入：

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 管理员统计看板增强 | 趋势图、分布图、考勤统计 | C1 |
| CSV 导入导出 | 批量管理数据 | C2 |
| 教学资料文件夹体系 | 资料分类管理 | C2 |
| 消息中心增强 | 系统消息、家长消息 | C3 |
| 课程选购商城 | 家长自主选课 | C3 |
| 多机构切换 | 一个管理员管多个校区 | C4 |
| 家长端课表优化 | 更丰富的日历视图 | C4 |
| AI 学情报告 | 自动生成个性化学习建议 | C5 |
| AI 教案辅助 | 辅助教师生成教案和习题 | C5 |

---

## 五、现有页面分级归类

### 保留并加强（A 级关联）

| 页面 | 加强方向 |
|------|---------|
| parent-index | 加入成长摘要卡片、进步通知入口、推荐好友入口 |
| parent-portfolio | 加入生成分享卡片功能 |
| parent-portfolio-detail | 品牌化展示、分享到朋友圈 |
| homework-detail | 评语温度感提升、进步通知触发 |
| scores | 加入进步趋势图、鼓励性文案 |
| enrollment | 加入推荐码入口、来源标记 |
| enrollment-status | 加入试听预约转化 |

### 简化优化（B 级关联）

| 页面 | 简化方向 |
|------|---------|
| teacher-index | 聚焦今日课程+快捷操作 |
| teacher-schedule | 聚焦今日视图，减少信息密度 |
| teacher-homework | 加入作业模板快捷发布 |
| teacher-homework-grade | 简化评语流程，加入快捷评语库 |
| teacher-portfolio-add | 拍照即归档，减少表单字段 |
| admin-index | 聚焦生源漏斗和续费提醒，弱化管理统计 |
| admin-enrollments | 加入来源标记和推荐追踪 |
| admin-class-detail | 加入续费倒计时 |

### 维持现状（B/C 级，不改动）

| 页面 | 理由 |
|------|------|
| login | 功能完整，无需改动 |
| admin-teachers / admin-teacher-detail / admin-teacher-edit | 基础管理，够用 |
| admin-students / admin-student-detail / admin-student-edit | 基础管理，够用 |
| admin-classes / admin-class-edit | 基础管理，够用 |
| admin-class-enroll | 基础管理，够用 |
| admin-courses / admin-course-edit | 基础管理，够用 |
| admin-announcement-edit / admin-announcements | 够用 |
| teacher-classes / teacher-class-detail | 够用 |
| teacher-course-detail | 够用 |
| teacher-materials / teacher-material-detail | 够用（C 级增强） |
| teacher-material-upload | 够用 |
| teacher-messages | 够用（C 级增强） |
| teacher-portfolio / teacher-portfolio-detail | 加入分享功能 |
| teacher-profile | 够用 |
| teacher-students / teacher-student-detail | 够用 |
| teacher-timetable | 够用 |
| parent-profile | 够用 |
| timetable | 够用 |
| my-courses | 够用 |
| course-detail | 够用 |
| course-select / courses | C 级增强 |
| homework / homework-submit | 够用 |
| progress | 加入进步趋势 |
| messages | 够用 |
| materials | 够用 |
| profile / profile-edit / settings | 够用 |

### 可后置（C 级，暂不投入）

| 页面 | 理由 |
|------|------|
| admin-stats | 当前是虚荣指标展示，改为NPS+生源来源后再做 |
| teacher-stats | 对核心链路贡献弱 |
| teacher-scores | 可简化为成绩录入，不需要复杂的统计视图 |
| index（学生首页） | 与 parent-index 合并，减少维护 |
| profile（通用） | 与角色专属 profile 合并 |

---

## 六、新增页面和接口总览

### 新增页面

| 页面路径 | 名称 | 优先级 |
|---------|------|--------|
| pages/growth-report/growth-report | 成长周报/月报 | A |
| pages/invite/invite | 推荐好友 | A |
| pages/school-home/school-home | 机构品牌展示页（无需登录） | A |
| pages/trial-report/trial-report | 试听体验报告 | A |
| pages/nps-survey/nps-survey | NPS 满意度调查 | B |
| pages/admin-gifts/admin-gifts | 管理员-礼品管理 | A |
| pages/admin-gift-edit/admin-gift-edit | 管理员-礼品编辑 | A |
| pages/admin-exchange-orders/admin-exchange-orders | 管理员-兑换订单 | A |
| pages/gift-shop/gift-shop | 家长-礼品商城 | A |
| pages/gift-detail/gift-detail | 家长-礼品详情/兑换 | A |
| pages/my-exchanges/my-exchanges | 家长-我的兑换 | A |

### 新增数据模型

| 模型 | 说明 | 优先级 |
|------|------|--------|
| school_profiles | 机构品牌信息 | A |
| referrals | 推荐关系记录 | A |
| trial_reports | 试听体验报告 | A |
| nps_surveys | NPS 满意度调查 | B |
| assignment_templates | 作业模板 | B |
| growth_reports | 成长报告快照（生成记录） | A |
| gift_points | 家长积分账户 | A |
| point_records | 积分流水 | A |
| share_records | 分享追踪记录 | A |
| gifts | 礼品 | A |
| exchange_orders | 兑换订单 | A |

#### 礼品积分数据模型详细定义

```
gift_points:
  id            VARCHAR(36) PK
  parent_id     VARCHAR(36) FK(parents.id) UNIQUE
  balance       INT DEFAULT 0        -- 当前可用积分
  total_earned  INT DEFAULT 0        -- 累计获得
  total_spent   INT DEFAULT 0        -- 累计消费
  created_at    DATETIME
  updated_at    DATETIME

point_records:
  id            VARCHAR(36) PK
  parent_id     VARCHAR(36) FK(parents.id) INDEX
  type          VARCHAR(30)           -- share_reward / exchange_deduct / exchange_refund
  amount        INT                   -- 正数=获得, 负数=消费
  share_id      VARCHAR(36) FK(share_records.id) NULLABLE
  description   TEXT NULLABLE
  created_at    DATETIME
  updated_at    DATETIME

share_records:
  id              VARCHAR(36) PK
  share_id        VARCHAR(50) UNIQUE INDEX  -- 唯一分享标识
  parent_id       VARCHAR(36) FK(parents.id) INDEX
  page_type       VARCHAR(30)              -- growth_report / school_home / invite
  page_path       TEXT NULLABLE
  visitor_openid  VARCHAR(100) NULLABLE
  visited         BOOLEAN DEFAULT FALSE
  points_awarded  BOOLEAN DEFAULT FALSE
  visited_at      DATETIME NULLABLE
  created_at      DATETIME
  updated_at      DATETIME

gifts:
  id               VARCHAR(36) PK
  name             VARCHAR(100)
  description      TEXT NULLABLE
  image            VARCHAR(500) NULLABLE
  stock            INT DEFAULT 0
  required_points  INT DEFAULT 0
  status           VARCHAR(20) DEFAULT 'off_shelf'  -- on_shelf / off_shelf
  created_at       DATETIME
  updated_at       DATETIME

exchange_orders:
  id            VARCHAR(36) PK
  gift_id       VARCHAR(36) FK(gifts.id)
  parent_id     VARCHAR(36) FK(parents.id) INDEX
  gift_name     VARCHAR(100)
  gift_image    VARCHAR(500) NULLABLE
  points_cost   INT
  status        VARCHAR(20) DEFAULT 'pending'
                -- pending / confirmed / shipped / completed / cancelled
  address_info  TEXT NULLABLE           -- JSON: {name, phone, address}
  created_at    DATETIME
  updated_at    DATETIME
```

#### 兑换订单状态流转

```
pending ──→ confirmed ──→ shipped ──→ completed
   │
   └──→ cancelled（退积分+还库存）
```

### 新增接口

| 接口 | 说明 | 优先级 |
|------|------|--------|
| POST /growth-reports/generate | 生成成长报告 | A |
| GET /growth-reports/latest | 获取最新报告 | A |
| POST /growth-reports/share | 生成分享卡片 | A |
| POST /referrals | 创建推荐 | A |
| GET /referrals/mine | 我的推荐 | A |
| GET /referrals/stats | 推荐统计 | A |
| GET /school-profile | 获取机构信息（公开） | A |
| PUT /school-profile | 更新机构信息 | A |
| POST /trial-reports | 创建试听报告 | A |
| GET /trial-reports/:id | 获取试听报告 | A |
| POST /trial-reports/:id/confirm | 家长确认报名 | A |
| POST /attendances/quick | 快速签到 | B |
| GET /assignments/templates | 作业模板列表 | B |
| POST /assignments/from-template | 从模板创建作业 | B |
| GET /renewals/upcoming | 即将到期列表 | B |
| POST /renewals/remind | 发送续费提醒 | B |
| POST /nps | 提交NPS评分 | B |
| GET /nps/current | 当前期调查 | B |
| GET /stats/nps | NPS统计 | B |
| GET /stats/source-distribution | 生源来源分布 | B |
| POST /notifications/progress | 触发进步通知 | A |
| GET /gift-points | 获取家长积分余额 | A |
| GET /point-records | 获取积分流水 | A |
| POST /share-records | 创建分享记录（生成shareId） | A |
| POST /share-records/visit | 访客打开分享（追踪+发积分） | A |
| GET /gifts | 礼品列表（支持status/keyword筛选） | A |
| GET /gifts/:id | 礼品详情 | A |
| POST /gifts | 新增礼品（管理员） | A |
| PUT /gifts/:id | 更新礼品（管理员） | A |
| DELETE /gifts/:id | 删除礼品（管理员） | A |
| GET /exchange-orders | 兑换订单列表（支持parent_id/status筛选） | A |
| POST /exchange-orders | 创建兑换订单（原子扣积分+减库存） | A |
| PUT /exchange-orders/:id/status | 更新订单状态（含取消退积分） | A |

---

## 七、迭代计划

### Phase 1：验证口碑假设（2周）

**目标：** 验证"家长愿意分享成长内容"

**产出：**
1. 成长周报功能（自动生成 + 分享卡片）
2. 作品集分享卡片功能

**验证方式：**
- 找1家合作机构，5-10位家长试用
- 衡量：分享率 ≥ 30%？分享后带来多少咨询？

**决策：** 分享率 < 15% → 需 pivot（调整内容形式或分享机制）

### Phase 2：最小口碑 MVP（4周）

**目标：** 验证"口碑→生源"链路

**产出：**
1. 机构品牌展示页
2. 推荐裂变机制
3. 试听体验报告
4. 进步通知推送

**验证方式：**
- 1家机构持续使用1个月
- 衡量：通过小程序来了几个新咨询？推荐转化率？

**决策：** 无新咨询 → 需 pivot（可能品牌页不够有说服力，或试听流程有问题）

### Phase 3：完整工具 MVP（6周）

**目标：** 让机构日常运营依赖 EduTrain

**产出：**
1. 教师极简操作（快速签到、拍照归档、作业模板）
2. 续费提醒
3. 生源来源追踪
4. NPS 满意度脉搏
5. 对接真实后端 API（替换 mock）

**验证方式：**
- 3-5家机构试用
- 衡量：机构是否主动要求续用？教师周均操作 ≥ 3次？NPS ≥ 40？

### Phase 4：裂变加速（按数据决策）

**目标：** 在验证链路后加速增长

**产出：**
1. 推荐奖励自动化
2. 品牌页 SEO 优化
3. 多机构数据对比（机构视角）
4. AI 功能（学情报告、教案辅助）

**前置条件：** Phase 2-3 验证口碑链路有效

---

## 八、埋点需求

### 8.1 核心事件

| 事件名 | 触发时机 | 参数 | 对应指标 |
|--------|---------|------|---------|
| page_view | 页面加载 | page_path, user_role | 活跃度 |
| share_card | 点击分享按钮 | card_type(growth_report/portfolio/trial_report) | 分享率 |
| share_complete | 分享成功 | card_type, share_target(friend/timeline) | 分享率 |
| recommend_click | 点击推荐好友 | referrer_id | 推荐率 |
| trial_booking | 预约试听 | source(referral/natural/ad) | 试听转化 |
| enrollment_submit | 提交报名 | source, class_id | 报名转化 |
| growth_report_view | 查看成长报告 | report_id, view_duration | 报告价值 |
| progress_notification_receive | 收到进步通知 | notification_type | 通知触达 |
| teacher_quick_action | 教师快捷操作 | action_type(attendance/photo/template) | 教师效率 |
| nps_submit | 提交NPS | score, comment | NPS |

### 8.2 漏斗追踪

```
分享卡片曝光 → 点击分享 → 分享成功 → 朋友打开 → 预约试听 → 到店试听 → 正式报名
   100%          ?%         ?%          ?%         ?%         ?%         ?%
```

每个环节都需要埋点，定位流失点。

---

## 九、风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 家长不愿意分享 | 口碑链路断裂 | Phase 1 先验证，不行就调整内容形式 |
| 教师嫌麻烦不用 | 没有内容产出（作品、评语） | 极简操作+自动触发，降低教师负担到每周15分钟 |
| 微信分享限制 | 分享卡片被折叠或限制 | 多种分享方式（海报、链接、小程序码） |
| 机构不配合推给家长 | 家长不知道有这个工具 | 提供家长引导话术和操作指南 |
| 试听转化率低 | 生源链路不通 | 优化体验报告质量，加入限时优惠 |

---

## 十、与现有后端的兼容性

### 新增模型对应的数据库表

所有新增表遵循现有后端的 `BaseMixin`（UUID主键 + created_at + updated_at），通过 Alembic 迁移添加。

### 现有接口不变

所有现有 API 接口保持兼容，新增功能只增加新接口，不修改已有接口的入参出参。

### Mock 数据更新

`data/mock.js` 需同步新增 mock 数据：
- `school_profile`（1条机构品牌信息）
- `referrals`（几条推荐记录）
- `trial_reports`（2-3条试听报告）
- `nps_surveys`（若干评分记录）
- `assignment_templates`（3-5条作业模板）
- `growth_reports`（1-2条成长报告）
- `referral_stats`（推荐统计汇总）

### 前端配置更新

`app.json` 的 pages 数组增加新页面路径。

---

## 附录：术语表

| 术语 | 定义 |
|------|------|
| NPS | Net Promoter Score，净推荐值，0-10分，9-10为推荐者，0-6为贬损者，NPS=推荐者%-贬损者% |
| 口碑链路 | 家长满意度→主动分享→新咨询→报名的转化路径 |
| 成长报告 | 自动汇总孩子学习数据生成的可视化周报/月报 |
| 品牌化展示 | 带机构 logo、品牌色、标语的统一视觉输出 |
| 推荐裂变 | 家长推荐好友→好友试听/报名→推荐人获得奖励的闭环机制 |
| 试听体验报告 | 试听课后的个性化评估报告，用于促进试听→报名转化 |
| 北极星指标 | 最核心的、指引产品方向的单一指标 |
