const api = require('../../utils/api.js');

Page({
  data: {
    gift: null,
    pointsBalance: 0,
    canExchange: false,
    showExchangeModal: false,
    addressForm: {
      name: '',
      phone: '',
      address: ''
    },
    loading: true,
    submitting: false,
    errors: {}
  },

  onLoad(options) {
    if (options.id) {
      this.loadGift(options.id);
    }
  },

  async loadGift(id) {
    this.setData({ loading: true });
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    try {
      const gift = await api.get('/gifts/' + id);
      let pointsBalance = 0;
      let parentId = null;

      if (userInfo && userInfo.role === 'parent') {
        const parents = await api.get('/parents', { user_id: userInfo.id });
        if (parents && parents.length > 0) {
          parentId = parents[0].id;
          const pointsInfo = await api.get('/gift-points', { parent_id: parentId });
          pointsBalance = pointsInfo ? pointsInfo.balance : 0;
        }
      }

      const canExchange = gift && gift.status === 'on_shelf' && gift.stock > 0 && pointsBalance >= gift.required_points;

      this.setData({
        gift,
        pointsBalance,
        canExchange,
        parentId,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  openExchangeModal() {
    if (!this.data.canExchange) {
      wx.showToast({ title: '积分不足或已兑完', icon: 'none' });
      return;
    }
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    this.setData({
      showExchangeModal: true,
      'addressForm.name': userInfo ? userInfo.name : '',
      'addressForm.phone': userInfo ? userInfo.phone : ''
    });
  },

  closeExchangeModal() {
    this.setData({ showExchangeModal: false });
  },

  onAddressInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['addressForm.' + field]: e.detail.value, ['errors.' + field]: '' });
  },

  async confirmExchange() {
    const { name, phone, address } = this.data.addressForm;
    const errors = {};
    if (!name || !name.trim()) errors.name = '请输入收件人';
    if (!phone || !/^1\d{10}$/.test(phone)) errors.phone = '请输入正确手机号';
    if (!address || !address.trim()) errors.address = '请输入收货地址';

    if (Object.keys(errors).length > 0) {
      this.setData({ errors });
      return;
    }

    this.setData({ submitting: true });
    try {
      const result = await api.post('/exchange-orders', {
        parent_id: this.data.parentId,
        gift_id: this.data.gift.id,
        address_info: { name: name.trim(), phone, address: address.trim() }
      });

      if (result) {
        wx.showToast({ title: '兑换成功', icon: 'success' });
        this.setData({ showExchangeModal: false, submitting: false });
        this.loadGift(this.data.gift.id);
      } else {
        wx.showToast({ title: '兑换失败，积分不足或库存不足', icon: 'none' });
        this.setData({ submitting: false });
      }
    } catch (err) {
      wx.showToast({ title: '兑换失败', icon: 'none' });
      this.setData({ submitting: false });
    }
  }
});
