// Firestore 에뮬레이터에 더미 데이터 주입 스크립트
// 사용법: node scripts/seedEmulator.js
// 에뮬레이터가 실행 중이어야 합니다 (http://localhost:8080)

const admin = require('firebase-admin');

// Firestore 에뮬레이터에 연결
// 프로젝트 ID는 .firebaserc 파일에서 자동으로 읽어옵니다
const projectId = process.env.FIREBASE_PROJECT_ID || require('../.firebaserc').projects.default;

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

// 에뮬레이터 설정
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const db = admin.firestore();

// 더미 사용자 데이터
const dummyUsers = [
  {
    uid: 'user1',
    email: 'seller@example.com',
    displayName: '판매자1',
    profileImageUrl: 'https://via.placeholder.com/150',
    point: 50000,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    uid: 'user2',
    email: 'buyer@example.com',
    displayName: '구매자1',
    profileImageUrl: 'https://via.placeholder.com/150',
    point: 30000,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    uid: 'user3',
    email: 'seller2@example.com',
    displayName: '판매자2',
    profileImageUrl: 'https://via.placeholder.com/150',
    point: 75000,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
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
    images: ['https://via.placeholder.com/400x300?text=노트북'],
    category: '전자제품',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    sellerId: 'user1',
    title: '아이패드 프로',
    description: '2021년 모델 아이패드 프로 판매합니다.',
    price: 800000,
    status: 'ON_SALE',
    images: ['https://via.placeholder.com/400x300?text=아이패드'],
    category: '전자제품',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    sellerId: 'user3',
    title: '무선 이어폰',
    description: 'AirPods Pro 2세대 판매합니다. 거의 새것입니다.',
    price: 200000,
    status: 'ON_SALE',
    images: ['https://via.placeholder.com/400x300?text=이어폰'],
    category: '전자제품',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    sellerId: 'user3',
    title: '게이밍 키보드',
    description: '기계식 키보드, 청축입니다.',
    price: 150000,
    status: 'RESERVED',
    images: ['https://via.placeholder.com/400x300?text=키보드'],
    category: '전자제품',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    sellerId: 'user1',
    title: '모니터 27인치',
    description: 'LG 27인치 모니터 판매합니다.',
    price: 300000,
    status: 'SOLD_OUT',
    images: ['https://via.placeholder.com/400x300?text=모니터'],
    category: '전자제품',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    sellerId: 'user2',
    title: '나이키 운동화',
    description: '사이즈 270, 거의 새것입니다.',
    price: 80000,
    status: 'ON_SALE',
    images: ['https://via.placeholder.com/400x300?text=운동화'],
    category: '의류',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    sellerId: 'user3',
    title: '책상',
    description: 'IKEA 책상 판매합니다.',
    price: 50000,
    status: 'ON_SALE',
    images: ['https://via.placeholder.com/400x300?text=책상'],
    category: '가구',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
];

async function seedEmulator() {
  try {
    console.log('🚀 Firestore 에뮬레이터에 더미 데이터를 주입합니다...');
    console.log('⚠️  에뮬레이터가 실행 중인지 확인하세요 (firebase emulators:start)\n');

    // 기존 데이터 삭제 (선택사항)
    console.log('기존 데이터 삭제 중...');
    const usersSnapshot = await db.collection('users').get();
    const productsSnapshot = await db.collection('products').get();
    
    const batch = db.batch();
    usersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    productsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('✓ 기존 데이터 삭제 완료\n');

    // 사용자 데이터 추가
    console.log('사용자 데이터 추가 중...');
    for (const user of dummyUsers) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`  ✓ ${user.displayName} (${user.email}) - ${user.point.toLocaleString()}원`);
    }

    // 상품 데이터 추가
    console.log('\n상품 데이터 추가 중...');
    for (const product of dummyProducts) {
      const docRef = await db.collection('products').add(product);
      console.log(`  ✓ ${product.title} - ${product.price.toLocaleString()}원 [${product.status}]`);
    }

    console.log('\n✅ 더미 데이터 주입이 완료되었습니다!');
    console.log('\n📝 다음 단계:');
    console.log('   1. React 앱 실행: npm start');
    console.log('   2. 브라우저에서 http://localhost:3000 접속');
    console.log('   3. 테스트 계정으로 로그인:');
    console.log('      - seller@example.com (비밀번호: 임의)');
    console.log('      - buyer@example.com (비밀번호: 임의)');
    console.log('\n⚠️  참고: 실제 로그인은 Firebase Auth를 통해 해야 합니다.');
    console.log('   에뮬레이터에서는 더미 사용자 데이터만 사용할 수 있습니다.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('\n💡 해결 방법:');
    console.error('   1. Firebase 에뮬레이터가 실행 중인지 확인');
    console.error('   2. 명령어: firebase emulators:start --only firestore');
    console.error('   3. 에뮬레이터가 http://localhost:8080 에서 실행 중인지 확인');
    process.exit(1);
  }
}

// 스크립트 실행
seedEmulator();

