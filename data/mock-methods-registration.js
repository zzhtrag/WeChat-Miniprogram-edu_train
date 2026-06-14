/**
 * Mock 方法 - 报名
 */
module.exports = {
  // ==================== 报名相关方法 ====================
  _generateRegCode() {
    let code;
    do {
      code = String(Math.floor(1000 + Math.random() * 9000));
    } while (this.registrations.some(r => r.code === code));
    return code;
  },

  getRegistrations(filters = {}) {
    let result = this.registrations.map(reg => {
      const classItem = reg.class_id ? this.getClassById(reg.class_id) : null;
      return {
        ...reg,
        class_name: classItem ? classItem.name : '',
        course_name: classItem ? classItem.course_name : ''
      };
    });

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(r =>
        r.student_name.includes(keyword) ||
        r.parent_name.includes(keyword) ||
        r.parent_phone.includes(keyword) ||
        r.code.includes(keyword)
      );
    }
    if (filters.status) result = result.filter(r => r.status === filters.status);

    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getRegistrationById(regId) {
    const reg = this.registrations.find(r => r.id === regId);
    if (!reg) return null;
    const classItem = reg.class_id ? this.getClassById(reg.class_id) : null;
    return {
      ...reg,
      class_name: classItem ? classItem.name : '',
      course_name: classItem ? classItem.course_name : ''
    };
  },

  getRegistrationsByPhone(phone) {
    return this.registrations
      .filter(r => r.parent_phone === phone)
      .map(reg => {
        const classItem = reg.class_id ? this.getClassById(reg.class_id) : null;
        return {
          ...reg,
          class_name: classItem ? classItem.name : '',
          course_name: classItem ? classItem.course_name : ''
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  addRegistration(data) {
    const now = new Date();
    const expire = new Date(now);
    expire.setMonth(expire.getMonth() + 1);

    const reg = {
      id: 'reg' + Date.now(),
      code: this._generateRegCode(),
      student_name: data.student_name,
      age: data.age || '',
      gender: data.gender || 'male',
      subject: data.subject || '',
      parent_name: data.parent_name,
      parent_phone: data.parent_phone,
      status: 'enrolled',
      class_id: null,
      user_id: null,
      expire_time: expire.toISOString().split('T')[0],
      created_at: now.toISOString().split('T')[0]
    };
    this.registrations.push(reg);
    return reg;
  },

  updateRegistrationStatus(regId, status, classId) {
    const index = this.registrations.findIndex(r => r.id === regId);
    if (index === -1) return null;

    this.registrations[index].status = status;
    if (classId) this.registrations[index].class_id = classId;

    if (status === 'admitted' && classId) {
      this._autoRegisterFromEnrollment(this.registrations[index]);
    }

    return this.registrations[index];
  },

  _autoRegisterFromEnrollment(reg) {
    const phone = reg.parent_phone;
    const existing = this.users.find(u => u.phone === phone);
    if (existing) {
      reg.user_id = existing.id;
      return existing;
    }

    const password = phone.length >= 6 ? phone.slice(-6) : phone;
    const newUser = {
      id: 'parent' + Date.now(),
      phone: phone,
      password: password,
      role: 'parent',
      name: reg.parent_name,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    this.users.push(newUser);
    reg.user_id = newUser.id;

    const parent = {
      id: 'p' + Date.now(),
      user_id: newUser.id,
      name: reg.parent_name,
      phone: phone,
      relation: '家长',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    this.parents.push(parent);

    const student = {
      id: 's' + Date.now(),
      student_no: 'S' + Date.now(),
      name: reg.student_name,
      gender: reg.gender,
      birthday: '',
      grade: '',
      parent_id: parent.id,
      address: '',
      tags: [],
      remarks: '通过报名自动创建',
      status: 'active',
      enrolled_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString().split('T')[0]
    };
    this.students.push(student);

    if (reg.class_id) {
      this.addEnrollment({
        student_id: student.id,
        class_id: reg.class_id
      });
    }

    return newUser;
  },

  getRegistrationStats() {
    const regs = this.registrations;
    return {
      total: regs.length,
      enrolled: regs.filter(r => r.status === 'enrolled').length,
      paid: regs.filter(r => r.status === 'paid').length,
      admitted: regs.filter(r => r.status === 'admitted').length
    };
  }
};
