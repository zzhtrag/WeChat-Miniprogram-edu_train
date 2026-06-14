const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    loginType: 'password',
    phone: '',
    password: '',
    code: '',
    showPassword: false,
    remember: false,
    agreed: false,
    loading: false,
    wxLoading: false,
    counting: false,
    countDown: 60,
    showRoleModal: false,
    availableRoles: [],
    selectedRole: '',
    pendingUserInfo: null
  },

  onLoad() {
    setTimeout(() => {
      this.checkLoginStatus();
    }, 300);
  },

  onLogoTap() {
    wx.navigateTo({ url: '/pages/school-home/school-home' });
  },

  checkLoginStatus() {
    const app = getApp();
    if (app.globalData.token && app.globalData.userInfo) {
      app.redirectToHome();
    }
  },

  switchLoginType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ loginType: type });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  toggleRemember() {
    this.setData({ remember: !this.data.remember });
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  async sendCode() {
    const { phone } = this.data;
    if (config.useMock) {
      if (!phone) {
        wx.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
    } else {
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
    }

    try {
      await api.post('/auth/send-code', { phone });
      this.setData({ counting: true, countDown: 60 });
      wx.showToast({ title: '验证码已发送', icon: 'success' });

      const timer = setInterval(() => {
        const countDown = this.data.countDown - 1;
        if (countDown <= 0) {
          clearInterval(timer);
          this.setData({ counting: false, countDown: 60 });
        } else {
          this.setData({ countDown });
        }
      }, 1000);
    } catch (err) {
      console.error('发送验证码失败:', err);
    }
  },

  async doLogin() {
    const { phone, password, code, loginType, agreed } = this.data;

    if (!agreed) {
      wx.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' });
      return;
    }

    if (config.useMock) {
      if (!phone) {
        wx.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
    } else {
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
    }

    if (loginType === 'password' && !password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    if (loginType === 'code' && !code) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      let result;
      if (loginType === 'code') {
        result = await api.post('/auth/code-login', { phone, code });
      } else {
        result = await api.post('/auth/login', { phone, password });
      }

      this.handleLoginResult(result);
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({
        title: err.message || '登录失败，请检查网络',
        icon: 'none',
        duration: 2000
      });
      console.error('登录失败:', err);
    }
  },

  async onWxPhoneLogin(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      return;
    }
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' });
      return;
    }

    this.setData({ wxLoading: true });

    try {
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });

      const result = await api.post('/auth/wx-phone-login', {
        code: loginRes.code,
        phone_code: e.detail.code,
      });

      this.handleLoginResult(result);
    } catch (err) {
      this.setData({ wxLoading: false });
      wx.showToast({
        title: '微信登录失败，请重试',
        icon: 'none',
        duration: 2000
      });
      console.error('微信登录失败:', err);
    }
  },

  handleLoginResult(result) {
    // Mock returns { success, id, phone, name, roles }
    // Real API returns { access_token, user_info }
    const app = getApp();

    if (config.useMock) {
      if (!result.success) {
        wx.showToast({ title: result.error || '登录失败', icon: 'none' });
        this.setData({ loading: false, wxLoading: false });
        return;
      }

      // Mock validateLogin returns: { success, userId, role, name, avatar, phone }
      const userId = result.userId || result.id;
      const userPhone = result.phone || this.data.phone;
      const roles = result.roles || (result.role ? [result.role] : []);

      const userInfo = {
        id: userId,
        phone: userPhone,
        name: result.name,
        avatar: result.avatar,
        role: roles[0]
      };

      if (roles.length > 1) {
        // Multiple roles — show selector
        this.setData({
          loading: false,
          wxLoading: false,
          showRoleModal: true,
          availableRoles: roles.map(r => ({
            value: r,
            name: r === 'admin' ? '管理员' : r === 'teacher' ? '教师' : '家长'
          })),
          selectedRole: roles[0],
          pendingUserInfo: { ...userInfo, _allRoles: roles }
        });
      } else {
        app.setToken('mock-token-' + userId);
        app.setUserInfo(userInfo);
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => { app.redirectToHome(); }, 1000);
      }
    } else {
      app.setToken(result.access_token);
      app.setUserInfo(result.user_info);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => { app.redirectToHome(); }, 1000);
    }
  },

  selectRole(e) {
    this.setData({ selectedRole: e.currentTarget.dataset.role });
  },

  closeRoleModal() {
    this.setData({ showRoleModal: false, loading: false, wxLoading: false });
  },

  confirmRole() {
    const { selectedRole, pendingUserInfo } = this.data;
    if (!selectedRole || !pendingUserInfo) return;

    const app = getApp();
    const userInfo = { ...pendingUserInfo, role: selectedRole };
    delete userInfo._allRoles;

    app.setToken('mock-token-' + pendingUserInfo.id);
    app.setUserInfo(userInfo);
    this.setData({ showRoleModal: false });
    wx.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => { app.redirectToHome(); }, 1000);
  },

  goToForgotPassword() {
    wx.showToast({ title: '请联系管理员重置密码', icon: 'none' });
  },

  viewAgreement(e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'user') {
      wx.navigateTo({ url: '/pages/agreement/agreement?type=user' });
    } else {
      wx.navigateTo({ url: '/pages/agreement/agreement?type=privacy' });
    }
  },

  goToEnrollment() {
    wx.navigateTo({ url: '/pages/enrollment/enrollment' });
  },

  goToEnrollmentStatus() {
    wx.navigateTo({ url: '/pages/enrollment-status/enrollment-status' });
  }
});
