const api = require('../../utils/api.js');

Page({
  data: {
    isEdit: false,
    giftId: null,
    formData: {
      name: '',
      description: '',
      image: '',
      stock: '',
      required_points: '',
      status: 'off_shelf'
    },
    loading: false,
    submitting: false,
    errors: {}
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, giftId: options.id });
      wx.setNavigationBarTitle({ title: '编辑礼品' });
      this.loadGift(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '新建礼品' });
    }
  },

  async loadGift(id) {
    this.setData({ loading: true });
    try {
      const gift = await api.get('/gifts/' + id);
      if (gift) {
        this.setData({
          formData: {
            name: gift.name,
            description: gift.description,
            image: gift.image,
            stock: String(gift.stock),
            required_points: String(gift.required_points),
            status: gift.status
          },
          loading: false
        });
      } else {
        wx.showToast({ title: '礼品不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value, 'errors.name': '' });
  },

  onDescriptionInput(e) {
    this.setData({ 'formData.description': e.detail.value });
  },

  onStockInput(e) {
    this.setData({ 'formData.stock': e.detail.value, 'errors.stock': '' });
  },

  onPointsInput(e) {
    this.setData({ 'formData.required_points': e.detail.value, 'errors.required_points': '' });
  },

  onStatusChange(e) {
    const statuses = ['on_shelf', 'off_shelf'];
    this.setData({ 'formData.status': statuses[e.detail.value] });
  },

  onChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ 'formData.image': tempFilePath });
      }
    });
  },

  removeImage() {
    this.setData({ 'formData.image': '' });
  },

  validate() {
    const { name, stock, required_points } = this.data.formData;
    const errors = {};
    if (!name || name.trim() === '') errors.name = '请输入礼品名称';
    if (!stock || parseInt(stock) < 0) errors.stock = '请输入有效库存数量';
    if (!required_points || parseInt(required_points) <= 0) errors.required_points = '请输入有效积分数';
    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  async onSubmit() {
    if (!this.validate()) return;
    this.setData({ submitting: true });
    try {
      const submitData = {
        name: this.data.formData.name.trim(),
        description: this.data.formData.description,
        image: this.data.formData.image,
        stock: parseInt(this.data.formData.stock),
        required_points: parseInt(this.data.formData.required_points),
        status: this.data.formData.status
      };
      let result;
      if (this.data.isEdit) {
        result = await api.put('/gifts/' + this.data.giftId, submitData);
      } else {
        result = await api.post('/gifts', submitData);
      }
      this.setData({ submitting: false });
      if (result) {
        wx.showToast({ title: this.data.isEdit ? '更新成功' : '创建成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      } else {
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    } catch (err) {
      this.setData({ submitting: false });
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此礼品吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) this.doDelete();
      }
    });
  },

  async doDelete() {
    try {
      await api.delete('/gifts/' + this.data.giftId);
      wx.showToast({ title: '删除成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  }
});
