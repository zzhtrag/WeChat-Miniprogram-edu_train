/**
 * 全局配置文件
 * 切换 useMock 即可在 mock 数据和真实 API 之间切换
 */

const env = 'dev'; // 'dev' | 'test' | 'prod'

const environments = {
  dev: {
    apiBase: 'http://127.0.0.1:8801',
    apiPrefix: '/api/v1'
  },
  test: {
    apiBase: 'http://192.168.1.100:8000',
    apiPrefix: '/api/v1'
  },
  prod: {
    apiBase: 'https://api.example.com',
    apiPrefix: '/api/v1'
  }
};

const config = {
  useMock: true,
  ...environments[env],
  timeout: 10000,

  // 科目配置
  subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '其他']
};

module.exports = config;
