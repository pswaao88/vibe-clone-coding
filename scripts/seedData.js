// 더미 데이터 생성 스크립트
// 사용법: node scripts/seedData.js

const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
// 실제 사용 시에는 서비스 계정 키 파일 경로를 지정하거나
// Firebase CLI로 인증된 환경에서 실행해야 합니다
// 프로젝트 ID는 .firebaserc 파일에서 읽어오거나 환경 변수로 설정
const projectId = process.env.FIREBASE_PROJECT_ID || require('../.firebaserc').projects.default;

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

const db = admin.firestore();

// 더미 사용자 데이터
const dummyUsers = [
  {
    uid: 'user1',
    email: 'seller@example.com',
    displayName: '판매자1',
    profileImageUrl: 'https://via.placeholder.com/150',
    point: 50000,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    uid: 'user2',
    email: 'buyer@example.com',
    displayName: '구매자1',
    profileImageUrl: 'https://via.placeholder.com/150',
    point: 30000,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    uid: 'user3',
    email: 'seller2@example.com',
    displayName: '판매자2',
    profileImageUrl: 'https://via.placeholder.com/150',
    point: 75000,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// 더미 상품 데이터
const dummyProducts = [
  {
    sellerId: 'user1',
    title: '중고 노트북',
    description: '잘 사용하던 노트북입니다. 성능 좋고 상태 깨끗합니다.',
    price: 500000,
    status: 'ON_SALE',
    images: ['https://via.placeholder.com/400'],
    category: '전자제품',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    sellerId: 'user1',
    title: '아이패드 프로',
    description: '2021년 모델 아이패드 프로 판매합니다.',
    price: 800000,
    status: 'ON_SALE',
    images: ['https://via.placeholder.com/400'],
    category: '전자제품',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    sellerId: 'user3',
    title: '무선 이어폰',
    description: 'AirPods Pro 2세대 판매합니다. 거의 새것입니다.',
    price: 200000,
    status: 'ON_SALE',
    images: ['https://via.placeholder.com/400'],
    category: '전자제품',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    sellerId: 'user3',
    title: '게이밍 키보드',
    description: '기계식 키보드, 청축입니다.',
    price: 150000,
    status: 'RESERVED',
    images: ['https://via.placeholder.com/400'],
    category: '전자제품',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    sellerId: 'user1',
    title: '모니터 27인치',
    description: 'LG 27인치 모니터 판매합니다.',
    price: 300000,
    status: 'SOLD_OUT',
    images: ['https://via.placeholder.com/400'],
    category: '전자제품',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function seedData() {
  try {
    console.log('더미 데이터 생성을 시작합니다...');

    // 사용자 데이터 추가
    console.log('\n사용자 데이터 추가 중...');
    for (const user of dummyUsers) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`✓ 사용자 추가: ${user.displayName} (${user.uid})`);
    }

    // 상품 데이터 추가
    console.log('\n상품 데이터 추가 중...');
    for (const product of dummyProducts) {
      const docRef = await db.collection('products').add(product);
      console.log(`✓ 상품 추가: ${product.title} (${docRef.id})`);
    }

    console.log('\n더미 데이터 생성이 완료되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedData();
