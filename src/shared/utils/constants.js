// 상품 상태
export const PRODUCT_STATUS = {
  ON_SALE: 'ON_SALE',
  RESERVED: 'RESERVED',
  SOLD_OUT: 'SOLD_OUT',
};

// 포인트 거래 타입
export const POINT_TRANSACTION_TYPE = {
  CHARGE: 'CHARGE',
  TRANSFER: 'TRANSFER',
};

// Firebase Cloud Functions URL
// ⚠️ 현재는 클라이언트 사이드로 이동하여 사용하지 않음
// 필요시 다시 활성화 가능
export const FUNCTIONS_URL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_FUNCTIONS_URL || 
    `http://localhost:5001/${process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-project-id'}/us-central1`  // 로컬 에뮬레이터
  : process.env.REACT_APP_FUNCTIONS_URL || 
    `https://us-central1-${process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-project-id'}.cloudfunctions.net`;  // 프로덕션
