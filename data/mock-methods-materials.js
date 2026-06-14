/**
 * Mock 方法 - 教学资料 + 文件夹 + 作品集
 */
const { MATERIAL_CATEGORIES, PORTFOLIO_CATEGORIES } = require('./mock-data');

module.exports = {
  // ==================== 教学资料相关方法 ====================
  getMaterials(filters = {}) {
    let result = this.teaching_materials.map(material => {
      const folder = this.teaching_folders.find(f => f.id === material.folder_id);
      const sharedClassNames = material.shared_class_ids.map(cid => {
        const cls = this.classes.find(c => c.id === cid);
        return cls ? cls.name : '';
      }).filter(Boolean);
      return {
        ...material,
        folder_name: folder ? folder.name : '',
        shared_class_names: sharedClassNames,
        category_label: MATERIAL_CATEGORIES[material.category] || material.category
      };
    });

    if (filters.teacher_id) result = result.filter(m => m.teacher_id === filters.teacher_id);
    if (filters.category) result = result.filter(m => m.category === filters.category);
    if (filters.subject) result = result.filter(m => m.subject === filters.subject);
    if (filters.folder_id) result = result.filter(m => m.folder_id === filters.folder_id);
    if (filters.is_shared !== undefined) result = result.filter(m => m.is_shared === filters.is_shared);
    if (filters.status) result = result.filter(m => m.status === filters.status);
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(kw) || m.description.toLowerCase().includes(kw));
    }

    return result;
  },

  getMaterialById(materialId) {
    const material = this.teaching_materials.find(m => m.id === materialId);
    if (!material) return null;
    const folder = this.teaching_folders.find(f => f.id === material.folder_id);
    const sharedClassDetails = material.shared_class_ids.map(cid => {
      const cls = this.classes.find(c => c.id === cid);
      return cls ? { id: cls.id, name: cls.name } : null;
    }).filter(Boolean);
    return {
      ...material,
      folder_name: folder ? folder.name : '',
      shared_class_details: sharedClassDetails,
      category_label: MATERIAL_CATEGORIES[material.category] || material.category
    };
  },

  addMaterial(materialData) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newMaterial = {
      id: 'tm' + Date.now(),
      teacher_id: materialData.teacher_id,
      title: materialData.title,
      category: materialData.category || 'other',
      subject: materialData.subject || '',
      description: materialData.description || '',
      file_type: materialData.file_type || 'other',
      file_name: materialData.file_name || '',
      file_size: materialData.file_size || 0,
      file_url: materialData.file_url || '',
      thumbnail: materialData.thumbnail || '',
      folder_id: materialData.folder_id || null,
      shared_class_ids: materialData.shared_class_ids || [],
      is_shared: (materialData.shared_class_ids || []).length > 0,
      download_count: 0,
      tags: materialData.tags || [],
      status: 'active',
      created_at: now,
      updated_at: now
    };
    this.teaching_materials.push(newMaterial);
    if (newMaterial.folder_id) {
      const folder = this.teaching_folders.find(f => f.id === newMaterial.folder_id);
      if (folder) folder.material_count = (folder.material_count || 0) + 1;
    }
    return newMaterial;
  },

  updateMaterial(materialId, materialData) {
    const index = this.teaching_materials.findIndex(m => m.id === materialId);
    if (index === -1) return null;
    const oldFolderId = this.teaching_materials[index].folder_id;
    this.teaching_materials[index] = {
      ...this.teaching_materials[index],
      ...materialData,
      is_shared: (materialData.shared_class_ids || this.teaching_materials[index].shared_class_ids).length > 0,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    const newFolderId = this.teaching_materials[index].folder_id;
    if (oldFolderId !== newFolderId) {
      if (oldFolderId) {
        const oldFolder = this.teaching_folders.find(f => f.id === oldFolderId);
        if (oldFolder) oldFolder.material_count = Math.max(0, (oldFolder.material_count || 0) - 1);
      }
      if (newFolderId) {
        const newFolder = this.teaching_folders.find(f => f.id === newFolderId);
        if (newFolder) newFolder.material_count = (newFolder.material_count || 0) + 1;
      }
    }
    return this.teaching_materials[index];
  },

  deleteMaterial(materialId) {
    const index = this.teaching_materials.findIndex(m => m.id === materialId);
    if (index === -1) return { success: false, error: '资料不存在' };
    const material = this.teaching_materials[index];
    if (material.folder_id) {
      const folder = this.teaching_folders.find(f => f.id === material.folder_id);
      if (folder) folder.material_count = Math.max(0, (folder.material_count || 0) - 1);
    }
    this.teaching_materials.splice(index, 1);
    return { success: true };
  },

  shareMaterialToClass(materialId, classId) {
    const material = this.teaching_materials.find(m => m.id === materialId);
    if (!material) return null;
    if (!material.shared_class_ids.includes(classId)) {
      material.shared_class_ids.push(classId);
      material.is_shared = true;
      material.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    return material;
  },

  unshareMaterialFromClass(materialId, classId) {
    const material = this.teaching_materials.find(m => m.id === materialId);
    if (!material) return null;
    material.shared_class_ids = material.shared_class_ids.filter(id => id !== classId);
    material.is_shared = material.shared_class_ids.length > 0;
    material.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return material;
  },

  getMaterialsSharedWithClass(classId) {
    return this.teaching_materials
      .filter(m => m.shared_class_ids.includes(classId) && m.status === 'active')
      .map(material => {
        const teacher = this.teachers.find(t => t.id === material.teacher_id);
        return {
          ...material,
          teacher_name: teacher ? teacher.name : '',
          category_label: MATERIAL_CATEGORIES[material.category] || material.category
        };
      });
  },

  // ==================== 资料文件夹相关方法 ====================
  getFolders(teacherId) {
    let folders = this.teaching_folders;
    if (teacherId) folders = folders.filter(f => f.teacher_id === teacherId);
    return folders.map(f => {
      const actualCount = this.teaching_materials.filter(m => m.folder_id === f.id && m.status === 'active').length;
      return { ...f, material_count: actualCount };
    }).sort((a, b) => a.sort_order - b.sort_order);
  },

  addFolder(folderData) {
    const newFolder = {
      id: 'tf' + Date.now(),
      teacher_id: folderData.teacher_id,
      name: folderData.name,
      subject: folderData.subject || '',
      parent_id: folderData.parent_id || null,
      material_count: 0,
      sort_order: folderData.sort_order || 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.teaching_folders.push(newFolder);
    return newFolder;
  },

  updateFolder(folderId, folderData) {
    const index = this.teaching_folders.findIndex(f => f.id === folderId);
    if (index === -1) return null;
    this.teaching_folders[index] = { ...this.teaching_folders[index], ...folderData };
    return this.teaching_folders[index];
  },

  deleteFolder(folderId) {
    const hasMaterials = this.teaching_materials.some(m => m.folder_id === folderId && m.status === 'active');
    if (hasMaterials) return { success: false, error: '文件夹内有资料，无法删除' };
    const index = this.teaching_folders.findIndex(f => f.id === folderId);
    if (index === -1) return { success: false, error: '文件夹不存在' };
    this.teaching_folders.splice(index, 1);
    return { success: true };
  },

  // ==================== 学生作品集相关方法 ====================
  getPortfolioItems(filters = {}) {
    let result = this.student_portfolios.map(item => {
      const student = this.students.find(s => s.id === item.student_id);
      const classItem = this.classes.find(c => c.id === item.class_id);
      const teacher = this.teachers.find(t => t.id === item.teacher_id);
      return {
        ...item,
        student_name: student ? student.name : '',
        student_avatar: student ? (this.users.find(u => u.id === student.user_id) || {}).avatar || '' : '',
        class_name: classItem ? classItem.name : '',
        teacher_name: teacher ? teacher.name : '',
        category_label: PORTFOLIO_CATEGORIES[item.category] || item.category
      };
    });

    if (filters.student_id) result = result.filter(i => i.student_id === filters.student_id);
    if (filters.class_id) result = result.filter(i => i.class_id === filters.class_id);
    if (filters.teacher_id) result = result.filter(i => i.teacher_id === filters.teacher_id);
    if (filters.category) result = result.filter(i => i.category === filters.category);
    if (filters.is_featured !== undefined) result = result.filter(i => i.is_featured === filters.is_featured);
    if (filters.is_excellent !== undefined) result = result.filter(i => i.is_excellent === filters.is_excellent);
    if (filters.status) result = result.filter(i => i.status === filters.status);
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(kw) || i.description.toLowerCase().includes(kw));
    }

    return result.sort((a, b) => new Date(b.work_date) - new Date(a.work_date));
  },

  getPortfolioItemById(itemId) {
    const item = this.student_portfolios.find(i => i.id === itemId);
    if (!item) return null;
    const student = this.students.find(s => s.id === item.student_id);
    const classItem = this.classes.find(c => c.id === item.class_id);
    const teacher = this.teachers.find(t => t.id === item.teacher_id);
    return {
      ...item,
      student_name: student ? student.name : '',
      student_avatar: student ? (this.users.find(u => u.id === student.user_id) || {}).avatar || '' : '',
      class_name: classItem ? classItem.name : '',
      teacher_name: teacher ? teacher.name : '',
      category_label: PORTFOLIO_CATEGORIES[item.category] || item.category
    };
  },

  addPortfolioItem(itemData) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newItem = {
      id: 'sp' + Date.now(),
      student_id: itemData.student_id,
      class_id: itemData.class_id,
      teacher_id: itemData.teacher_id,
      title: itemData.title,
      category: itemData.category || 'other',
      description: itemData.description || '',
      file_type: itemData.file_type || 'jpg',
      file_name: itemData.file_name || '',
      file_size: itemData.file_size || 0,
      file_url: itemData.file_url || '',
      thumbnail: itemData.thumbnail || '',
      is_featured: itemData.is_featured || false,
      is_excellent: itemData.is_excellent || false,
      tags: itemData.tags || [],
      teacher_comment: itemData.teacher_comment || '',
      work_date: itemData.work_date || new Date().toISOString().split('T')[0],
      status: 'active',
      created_at: now,
      updated_at: now
    };
    this.student_portfolios.push(newItem);
    return newItem;
  },

  updatePortfolioItem(itemId, itemData) {
    const index = this.student_portfolios.findIndex(i => i.id === itemId);
    if (index === -1) return null;
    this.student_portfolios[index] = {
      ...this.student_portfolios[index],
      ...itemData,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    return this.student_portfolios[index];
  },

  deletePortfolioItem(itemId) {
    const index = this.student_portfolios.findIndex(i => i.id === itemId);
    if (index === -1) return { success: false, error: '作品不存在' };
    this.student_portfolios.splice(index, 1);
    return { success: true };
  },

  togglePortfolioFeatured(itemId) {
    const item = this.student_portfolios.find(i => i.id === itemId);
    if (!item) return null;
    item.is_featured = !item.is_featured;
    item.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return item;
  },

  togglePortfolioExcellent(itemId) {
    const item = this.student_portfolios.find(i => i.id === itemId);
    if (!item) return null;
    item.is_excellent = !item.is_excellent;
    item.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return item;
  },

  getStudentPortfolioTimeline(studentId) {
    const items = this.getPortfolioItems({ student_id: studentId });
    const grouped = {};
    items.forEach(item => {
      const date = new Date(item.work_date);
      const monthKey = date.getFullYear() + '年' + (date.getMonth() + 1) + '月';
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
    });
    return Object.entries(grouped).map(([month, items]) => ({ month, items }));
  },

  getClassPortfolioStats(classId) {
    const items = this.student_portfolios.filter(i => i.class_id === classId && i.status === 'active');
    const studentCounts = {};
    items.forEach(item => {
      if (!studentCounts[item.student_id]) {
        const student = this.students.find(s => s.id === item.student_id);
        studentCounts[item.student_id] = { student_id: item.student_id, student_name: student ? student.name : '', count: 0 };
      }
      studentCounts[item.student_id].count++;
    });
    return {
      total_items: items.length,
      featured_count: items.filter(i => i.is_featured).length,
      excellent_count: items.filter(i => i.is_excellent).length,
      student_counts: Object.values(studentCounts)
    };
  },

  getTeacherMaterialStats(teacherId) {
    const materials = this.teaching_materials.filter(m => m.teacher_id === teacherId && m.status === 'active');
    const byCategory = {};
    Object.keys(MATERIAL_CATEGORIES).forEach(key => {
      byCategory[key] = materials.filter(m => m.category === key).length;
    });
    return {
      total_count: materials.length,
      by_category: byCategory,
      shared_count: materials.filter(m => m.is_shared).length,
      folder_count: this.teaching_folders.filter(f => f.teacher_id === teacherId).length
    };
  },

  getTeacherPortfolioStats(teacherId) {
    const items = this.student_portfolios.filter(i => i.teacher_id === teacherId && i.status === 'active');
    const byCategory = {};
    Object.keys(PORTFOLIO_CATEGORIES).forEach(key => {
      byCategory[key] = items.filter(i => i.category === key).length;
    });
    return {
      total_count: items.length,
      featured_count: items.filter(i => i.is_featured).length,
      excellent_count: items.filter(i => i.is_excellent).length,
      by_category: byCategory
    };
  }
};
