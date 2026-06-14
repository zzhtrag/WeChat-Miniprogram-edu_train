const api = require('../../utils/api.js');
const sharePoints = require('../../utils/share-points.js');

Page({
  data: {
    schoolInfo: {},
    courses: [],
    portfolioItems: [],
    reviews: [],
    showBookingModal: false,
    bookingForm: {
      name: '',
      phone: '',
      courseIndex: -1,
      referralCode: ''
    },
    courseNames: [],
    referralCode: '',
    shareId: ''
  },

  onLoad(options) {
    this.loadData();
    if (options.ref) {
      this.setData({ referralCode: options.ref });
    }
    if (options.shareId) {
      sharePoints.trackShareVisit(options);
    }
  },

  async loadData() {
    // 学校信息独立加载，不依赖其他接口
    try {
      const schoolInfo = await api.get('/school-profile');
      this.setData({ schoolInfo: schoolInfo || {} });
      if (schoolInfo && schoolInfo.name) {
        wx.setNavigationBarTitle({ title: schoolInfo.name });
      }
    } catch (err) {
      console.error('加载学校信息失败', err);
    }

    // 其他数据独立加载
    try {
      const courses = await api.get('/courses', { status: 'active' });
      this.setData({ courses: courses || [], courseNames: courses ? courses.map(c => c.name) : [] });
    } catch (err) {}

    try {
      const portfolioItems = await api.get('/portfolios/featured', { limit: 6 });
      this.setData({ portfolioItems: portfolioItems || [] });
    } catch (err) {}

    try {
      const reviews = await api.get('/reviews', { limit: 5 });
      this.setData({ reviews: reviews || [] });
    } catch (err) {}

    this.prepareShareId();
  },

  bookTrial() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    this.setData({
      'bookingForm.name': userInfo ? (userInfo.name || '') : '',
      'bookingForm.phone': userInfo ? (userInfo.phone || '') : '',
      'bookingForm.courseIndex': -1,
      'bookingForm.referralCode': this.data.referralCode || ''
    });
    this.setData({ showBookingModal: true });
  },

  closeBookingModal() {
    this.setData({ showBookingModal: false });
  },

  onBookingInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ ['bookingForm.' + field]: e.detail.value });
  },

  onCoursePick(e) {
    this.setData({ 'bookingForm.courseIndex': e.detail.value });
  },

  async submitBooking() {
    const { name, phone, courseIndex, referralCode } = this.data.bookingForm;

    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!phone || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }

    try {
      await api.post('/registrations', {
        student_name: name.trim(),
        parent_name: name.trim(),
        parent_phone: phone,
        subject: courseIndex >= 0 ? this.data.courses[courseIndex].subject : null
      });

      wx.showToast({ title: '预约成功', icon: 'success' });
      this.setData({
        showBookingModal: false,
        'bookingForm.name': '',
        'bookingForm.phone': '',
        'bookingForm.courseIndex': -1,
        'bookingForm.referralCode': ''
      });
    } catch (err) {
      wx.showToast({ title: '预约失败，请稍后重试', icon: 'none' });
    }
  },

  openMap() {
    const { address } = this.data.schoolInfo;
    if (!address) return;
    wx.openLocation({
      latitude: this.data.schoolInfo.latitude || 39.9042,
      longitude: this.data.schoolInfo.longitude || 116.4074,
      name: this.data.schoolInfo.name,
      address: address
    });
  },

  callPhone() {
    const { contact_phone } = this.data.schoolInfo;
    if (!contact_phone) return;
    wx.makePhoneCall({ phoneNumber: contact_phone });
  },

  scrollToInfo() {
    wx.pageScrollTo({
      selector: '#school-info',
      duration: 300
    });
  },

  onLogoTap() {
    this.scrollToInfo();
  },

  goToEnroll() {
    wx.navigateTo({
      url: '/pages/enrollment/enrollment'
    });
  },

  shareSchool() {
    wx.showToast({ title: '请点击右上角分享', icon: 'none' });
  },

  onShareAppMessage() {
    const { name, slogan } = this.data.schoolInfo;
    let path = '/pages/school-home/school-home';
    const params = [];
    if (this.data.referralCode) {
      params.push('ref=' + this.data.referralCode);
    }
    if (this.data.shareId) {
      params.push('shareId=' + this.data.shareId);
    }
    if (params.length > 0) {
      path += '?' + params.join('&');
    }
    return {
      title: slogan || (name || '培训机构') + ' - 欢迎预约试听',
      path: path
    };
  },

  async prepareShareId() {
    const app = getApp();
    if (app.globalData.userInfo && app.globalData.userInfo.role === 'parent') {
      const parentId = await sharePoints.getParentId();
      if (parentId) {
        const shareId = await sharePoints.createShareRecord(parentId, 'school_home', '/pages/school-home/school-home');
        if (shareId) {
          this.setData({ shareId });
        }
      }
    }
  }
});