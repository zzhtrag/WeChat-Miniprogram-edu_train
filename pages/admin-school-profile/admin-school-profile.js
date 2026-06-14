const api = require('../../utils/api.js');

Page({
  data: {
    form: {
      name: '',
      slogan: '',
      description: '',
      contact_phone: '',
      address: '',
      latitude: null,
      longitude: null,
      business_hours: '',
      logo: '',
      banner: '',
      features: []
    },
    featureInput: '',
    loading: false
  },

  onLoad() {
    this.loadData();
  },

  async loadData() {
    try {
      const data = await api.get('/school-profile');
      if (data) {
        this.setData({
          form: {
            name: data.name || '',
            slogan: data.slogan || '',
            description: data.description || '',
            contact_phone: data.contact_phone || '',
            address: data.address || '',
            latitude: data.latitude,
            longitude: data.longitude,
            business_hours: data.business_hours || '',
            logo: data.logo || '',
            banner: data.banner || '',
            features: data.features || []
          }
        });
      }
    } catch (err) {}
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onFeatureInput(e) {
    this.setData({ featureInput: e.detail.value });
  },

  addFeature() {
    const text = this.data.featureInput.trim();
    if (!text) return;
    const features = [...this.data.form.features, { icon: '✓', text }];
    this.setData({ 'form.features': features, featureInput: '' });
  },

  removeFeature(e) {
    const idx = e.currentTarget.dataset.index;
    const features = this.data.form.features.filter((_, i) => i !== idx);
    this.setData({ 'form.features': features });
  },

  chooseImage(e) {
    const field = e.currentTarget.dataset.field;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempUrl = res.tempFiles[0].tempFilePath;
        this.setData({ [`form.${field}`]: tempUrl });
      }
    });
  },

  async save() {
    const { form } = this.data;
    if (!form.name.trim()) {
      wx.showToast({ title: '请输入学校名称', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    try {
      await api.put('/school-profile', form);
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
    this.setData({ loading: false });
  }
});
