const api = require('./api.js');

async function createShareRecord(parentId, pageType, pagePath) {
  try {
    const record = await api.post('/share-records', {
      parent_id: parentId,
      page_type: pageType,
      page_path: pagePath
    });
    return record.share_id;
  } catch (err) {
    return null;
  }
}

async function trackShareVisit(options) {
  if (!options || !options.shareId) return;
  try {
    const app = getApp();
    const visitorOpenid = app.globalData.userInfo ? app.globalData.userInfo.id : 'anonymous';
    const result = await api.post('/share-records/visit', {
      share_id: options.shareId,
      visitor_openid: visitorOpenid
    });
    if (result && result.success && result.points_awarded) {
      wx.showToast({ title: '分享积分已发放', icon: 'success', duration: 2000 });
    }
  } catch (err) {}
}

async function getParentId() {
  const app = getApp();
  const userInfo = app.globalData.userInfo;
  if (!userInfo) return null;
  try {
    const parents = await api.get('/parents', { user_id: userInfo.id });
    return parents && parents.length > 0 ? parents[0].id : null;
  } catch (err) {
    return null;
  }
}

async function hasShared(parentId, pageType, pagePath) {
  try {
    const record = await api.get('/share-records', { parent_id: parentId, page_type: pageType, page_path: pagePath });
    return !!record;
  } catch (err) {
    return false;
  }
}

module.exports = {
  createShareRecord,
  trackShareVisit,
  getParentId,
  hasShared
};
