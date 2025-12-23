const admin = require('firebase-admin');

// Firebase Cloud Functions에서는 자동으로 초기화됨
// 로컬 개발 환경에서만 수동 초기화 필요
if (!admin.apps.length) {
  admin.initializeApp();
}

module.exports = admin;
