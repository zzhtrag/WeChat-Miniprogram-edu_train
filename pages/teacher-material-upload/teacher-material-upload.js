const api = require('../../utils/api.js');
const fileUtil = require('../../utils/fileUtil.js');

Page({
  data: {
    isEdit: false,
    materialId: '',
    title: '',
    category: 'courseware',
    categoryOptions: [
      { key: 'courseware', label: '课件' },
      { key: 'lesson_plan', label: '教案' },
      { key: 'exercise', label: '习题' },
      { key: 'reference', label: '参考资料' },
      { key: 'other', label: '其他' }
    ],
    categoryIndex: 0,
    subject: '',
    subjectOptions: [],
    subjectIndex: 0,
    description: '',
    tagsInput: '',
    folderId: null,
    folderOptions: [],
    folderIndex: 0,
    selectedFileName: '',
    selectedFileSize: 0,
    selectedFileSizeStr: '',
    selectedFileType: '',
    selectedFileUrl: '',
    selectedFileThumb: '',
    classOptions: [],
    selectedClassIds: [],
    submitting: false
  },

  async onLoad(options) {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const teachers = await api.get('/teachers');
    const teacher = teachers?.find(t => t.user_id === userInfo?.id);
    if (!teacher) return;

    const teacherId = teacher.id;
    const subjects = teacher.subjects || [];
    const folders = await api.get('/folders', teacherId);
    const classes = await api.get('/teachers/' + teacherId + '/classes');

    const folderOptions = [{ id: null, name: '不选择文件夹' }].concat(
      folders.map(f => ({ id: f.id, name: f.name }))
    );

    this.setData({
      teacherId,
      subjectOptions: subjects,
      subject: subjects[0] || '',
      folderOptions,
      classOptions: classes
    });

    if (options.id) {
      this.loadMaterial(options.id);
    }
  },

  async loadMaterial(materialId) {
    const material = await api.get('/materials/' + materialId);
    if (!material) return;

    const categoryIndex = this.data.categoryOptions.findIndex(c => c.key === material.category);
    const subjectIndex = this.data.subjectOptions.indexOf(material.subject);
    const folderIndex = this.data.folderOptions.findIndex(f => f.id === material.folder_id);
    const selectedClassIds = material.shared_class_ids || [];

    this.setData({
      isEdit: true,
      materialId,
      title: material.title,
      category: material.category,
      categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
      subject: material.subject,
      subjectIndex: subjectIndex >= 0 ? subjectIndex : 0,
      description: material.description,
      tagsInput: (material.tags || []).join('、'),
      folderId: material.folder_id,
      folderIndex: folderIndex >= 0 ? folderIndex : 0,
      selectedFileName: material.file_name,
      selectedFileSize: material.file_size,
      selectedFileSizeStr: fileUtil.formatFileSize(material.file_size),
      selectedFileType: material.file_type,
      selectedFileUrl: material.file_url,
      selectedClassIds
    });
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      category: this.data.categoryOptions[index].key
    });
  },

  onSubjectChange(e) {
    const index = e.detail.value;
    this.setData({
      subjectIndex: index,
      subject: this.data.subjectOptions[index]
    });
  },

  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  onTagsInput(e) {
    this.setData({ tagsInput: e.detail.value });
  },

  onFolderChange(e) {
    const index = e.detail.value;
    this.setData({
      folderIndex: index,
      folderId: this.data.folderOptions[index].id
    });
  },

  chooseFile() {
    wx.showActionSheet({
      itemList: ['选择文档（PPT/Word/PDF等）', '选择图片'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.chooseDocument();
        } else if (res.tapIndex === 1) {
          this.chooseImage();
        }
      }
    });
  },

  chooseDocument() {
    fileUtil.chooseFileForMaterial((err, tempFiles) => {
      if (err || !tempFiles || !tempFiles.length) return;
      const file = tempFiles[0];
      const ext = file.name.split('.').pop().toLowerCase();
      this.setData({
        selectedFileName: file.name,
        selectedFileSize: file.size,
        selectedFileSizeStr: fileUtil.formatFileSize(file.size),
        selectedFileType: ext,
        selectedFileUrl: file.path
      });
    });
  },

  chooseImage() {
    fileUtil.chooseImageForPortfolio((err, tempFilePaths, tempFiles) => {
      if (err || !tempFilePaths || !tempFilePaths.length) return;
      const file = tempFiles[0];
      const ext = file.path.split('.').pop().toLowerCase();
      this.setData({
        selectedFileName: file.path.split('/').pop() || 'image.' + ext,
        selectedFileSize: file.size,
        selectedFileSizeStr: fileUtil.formatFileSize(file.size),
        selectedFileType: ext === 'jpg' || ext === 'jpeg' ? 'jpg' : ext,
        selectedFileUrl: tempFilePaths[0],
        selectedFileThumb: tempFilePaths[0]
      });
    });
  },

  removeFile() {
    this.setData({
      selectedFileName: '',
      selectedFileSize: 0,
      selectedFileSizeStr: '',
      selectedFileType: '',
      selectedFileUrl: '',
      selectedFileThumb: ''
    });
  },

  toggleClass(e) {
    const classId = e.currentTarget.dataset.id;
    let selectedClassIds = [...this.data.selectedClassIds];
    const idx = selectedClassIds.indexOf(classId);
    if (idx >= 0) {
      selectedClassIds.splice(idx, 1);
    } else {
      selectedClassIds.push(classId);
    }
    this.setData({ selectedClassIds });
  },

  async submit() {
    const { title, category, subject, description, tagsInput, folderId,
      selectedFileName, selectedFileType, selectedFileSize, selectedFileUrl,
      selectedFileThumb, selectedClassIds, isEdit, materialId } = this.data;

    if (!title.trim()) {
      wx.showToast({ title: '请输入资料标题', icon: 'none' });
      return;
    }
    if (!isEdit && !selectedFileName) {
      wx.showToast({ title: '请选择文件', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const tags = fileUtil.parseTagsInput(tagsInput);
    const materialData = {
      title: title.trim(),
      category,
      subject,
      description,
      tags,
      folder_id: folderId,
      file_type: selectedFileType || 'other',
      file_name: selectedFileName,
      file_size: selectedFileSize,
      file_url: selectedFileUrl,
      thumbnail: selectedFileThumb,
      shared_class_ids: selectedClassIds
    };

    try {
      if (isEdit) {
        await api.put('/materials/' + materialId, materialData);
        wx.showToast({ title: '保存成功', icon: 'success' });
      } else {
        materialData.teacher_id = this.data.teacherId;
        await api.post('/materials', materialData);
        wx.showToast({ title: '上传成功', icon: 'success' });
      }

      setTimeout(() => {
        this.setData({ submitting: false });
        wx.navigateBack();
      }, 800);
    } catch (err) {
      this.setData({ submitting: false });
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});
