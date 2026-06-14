// pages/admin-announcement-edit/admin-announcement-edit.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    // 是否是编辑模式
    isEdit: false,
    announcementId: null,
    // 表单数据
    formData: {
      title: '',
      content: '',
      type: 'system',
      is_pinned: false,
      expire_time: '',
      status: 'draft'
    },
    // 原始数据（编辑时保存）
    originalData: null,
    // 状态
    loading: false,
    submitting: false,
    // 验证错误
    errors: {}
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        announcementId: options.id
      });
      wx.setNavigationBarTitle({ title: '编辑公告' });
      this.loadAnnouncement(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '新建公告' });
    }
  },

  onReady() {
    // 设置默认过期时间（3个月后）
    const defaultExpire = new Date();
    defaultExpire.setMonth(defaultExpire.getMonth() + 3);
    const expireStr = defaultExpire.toISOString().split('T')[0];
    this.setData({
      'formData.expire_time': expireStr
    });
  },

  // 加载公告详情
  async loadAnnouncement(id) {
    this.setData({ loading: true });

    try {
      const announcement = await api.get('/announcements/' + id);

      if (announcement) {
        this.setData({
          formData: {
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            is_pinned: announcement.is_pinned,
            expire_time: announcement.expire_time,
            status: announcement.status
          },
          originalData: announcement,
          loading: false
        });
      } else {
        wx.showToast({ title: '公告不存在', icon: 'none' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '公告不存在', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value,
      'errors.title': ''
    });
  },

  // 内容输入
  onContentInput(e) {
    this.setData({
      'formData.content': e.detail.value,
      'errors.content': ''
    });
  },

  // 选择公告类型
  onTypeChange(e) {
    const types = ['system', 'parent', 'teacher'];
    this.setData({
      'formData.type': types[e.detail.value]
    });
  },

  // 切换置顶
  onPinnedChange(e) {
    this.setData({
      'formData.is_pinned': e.detail.value.length > 0
    });
  },

  // 选择过期时间
  onExpireTimeChange(e) {
    this.setData({
      'formData.expire_time': e.detail.value
    });
  },

  // 选择状态
  onStatusChange(e) {
    const statusMap = { 0: 'draft', 1: 'published' };
    this.setData({
      'formData.status': statusMap[e.detail.value]
    });
  },

  // 表单验证
  validate() {
    const { title, content } = this.data.formData;
    const errors = {};

    if (!title || title.trim() === '') {
      errors.title = '请输入公告标题';
    }

    if (!content || content.trim() === '') {
      errors.content = '请输入公告内容';
    }

    this.setData({ errors });

    return Object.keys(errors).length === 0;
  },

  // 保存草稿
  onSaveDraft() {
    this.setData({
      'formData.status': 'draft'
    });
    this.onSubmit();
  },

  // 发布
  onPublish() {
    this.setData({
      'formData.status': 'published'
    });
    this.onSubmit();
  },

  // 提交表单
  async onSubmit() {
    if (!this.validate()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      let result;
      if (this.data.isEdit) {
        result = await api.put('/announcements/' + this.data.announcementId, this.data.formData);
      } else {
        result = await api.post('/announcements', this.data.formData);
      }

      this.setData({ submitting: false });

      if (result) {
        const action = this.data.isEdit ? '更新' : '发布';
        const successMsg = this.data.formData.status === 'published' ? `${action}成功` : '保存草稿成功';

        wx.showToast({
          title: successMsg,
          icon: 'success'
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    } catch (err) {
      this.setData({ submitting: false });
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 删除公告（编辑模式）
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此公告吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.doDelete();
        }
      }
    });
  },

  async doDelete() {
    try {
      await api.delete('/announcements/' + this.data.announcementId);
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  }
});
