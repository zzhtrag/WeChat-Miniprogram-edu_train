function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + units[i];
}

function getFileTypeIcon(fileType) {
  const icons = {
    pptx: '📊', ppt: '📊',
    docx: '📄', doc: '📄',
    pdf: '📕',
    xlsx: '📗', xls: '📗',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
    mp4: '🎬', mp3: '🎵', wav: '🎵',
    zip: '📦', rar: '📦'
  };
  return icons[fileType] || '📎';
}

function getFileTypeColor(fileType) {
  const colors = {
    pptx: '#D04423', ppt: '#D04423',
    docx: '#2B579A', doc: '#2B579A',
    pdf: '#E74C3C',
    xlsx: '#217346', xls: '#217346',
    jpg: '#F59E0B', jpeg: '#F59E0B', png: '#F59E0B', gif: '#F59E0B',
    mp4: '#8B5CF6', mp3: '#8B5CF6', wav: '#8B5CF6'
  };
  return colors[fileType] || '#6B7280';
}

function chooseImageForPortfolio(callback) {
  wx.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      callback(null, res.tempFilePaths, res.tempFiles);
    },
    fail(err) {
      callback(err);
    }
  });
}

function chooseFileForMaterial(callback) {
  wx.chooseMessageFile({
    count: 1,
    type: 'all',
    success(res) {
      callback(null, res.tempFiles);
    },
    fail(err) {
      callback(err);
    }
  });
}

function simulateUpload(filePath) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: filePath,
        success: true
      });
    }, 500);
  });
}

function parseTagsInput(tagStr) {
  if (!tagStr) return [];
  return tagStr.split(/[,，、\s]+/).filter(t => t.trim()).map(t => t.trim());
}

// ==================== CSV 工具 ====================

function escapeCSVField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function generateCSV(headers, rows) {
  const headerLine = headers.map(h => escapeCSVField(h.label)).join(',');
  const dataLines = rows.map(row =>
    headers.map(h => escapeCSVField(row[h.key])).join(',')
  );
  return '﻿' + [headerLine, ...dataLines].join('\n');
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    result.push(row);
  }
  return result;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function exportCSV(filename, headers, rows) {
  const csv = generateCSV(headers, rows);
  const fs = wx.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/${filename}`;

  try {
    fs.writeFileSync(filePath, csv, 'utf8');
  } catch (e) {
    wx.showToast({ title: '导出失败', icon: 'none' });
    return;
  }

  wx.shareFileMessage({
    filePath: filePath,
    fileName: filename,
    success() {},
    fail() {
      wx.openDocument({
        filePath: filePath,
        showMenu: true,
        success() {},
        fail() {
          wx.showToast({ title: '请手动保存文件', icon: 'none' });
        }
      });
    }
  });
}

function importCSV(acceptExtensions) {
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: acceptExtensions || ['csv'],
      success(res) {
        const filePath = res.tempFiles[0].path;
        const fs = wx.getFileSystemManager();

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const cleaned = content.replace(/^﻿/, '');
          const rows = parseCSV(cleaned);

          if (rows.length === 0) {
            wx.showToast({ title: '文件无有效数据', icon: 'none' });
            reject(new Error('无有效数据'));
            return;
          }
          resolve(rows);
        } catch (e) {
          wx.showToast({ title: '文件读取失败', icon: 'none' });
          reject(e);
        }
      },
      fail() {
        reject(new Error('取消选择'));
      }
    });
  });
}

function downloadTemplate(filename, headers, sampleRow) {
  const csv = generateCSV(headers, sampleRow ? [sampleRow] : []);
  const fs = wx.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/${filename}`;

  try {
    fs.writeFileSync(filePath, csv, 'utf8');
  } catch (e) {
    wx.showToast({ title: '模板生成失败', icon: 'none' });
    return;
  }

  wx.shareFileMessage({
    filePath: filePath,
    fileName: filename,
    success() {},
    fail() {
      wx.openDocument({
        filePath: filePath,
        showMenu: true,
        success() {},
        fail() {
          wx.showToast({ title: '请手动保存文件', icon: 'none' });
        }
      });
    }
  });
}

module.exports = {
  formatFileSize,
  getFileTypeIcon,
  getFileTypeColor,
  chooseImageForPortfolio,
  chooseFileForMaterial,
  simulateUpload,
  parseTagsInput,
  generateCSV,
  parseCSV,
  exportCSV,
  importCSV,
  downloadTemplate
};
