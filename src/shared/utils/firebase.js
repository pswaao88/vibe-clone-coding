import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스
export const auth = getAuth(app);
export const db = getFirestore(app);

// 에뮬레이터 사용 여부 확인
const useEmulator = process.env.NODE_ENV === 'development' && 
                    process.env.REACT_APP_USE_EMULATOR !== 'false';

// 로컬 개발 환경에서 에뮬레이터 연결
if (useEmulator) {
  // Firestore 에뮬레이터 연결
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firestore 에뮬레이터에 연결되었습니다. (localhost:8080)');
  } catch (error) {
    // 이미 연결된 경우 무시
    if (error.message && error.message.includes('already been connected')) {
      console.log('ℹ️ Firestore 에뮬레이터가 이미 연결되어 있습니다.');
    } else {
      console.warn('⚠️ Firestore 에뮬레이터 연결 실패:', error.message);
      console.warn('💡 에뮬레이터가 실행 중인지 확인하세요: npm run emulators:firestore');
    }
  }

  // Auth 에뮬레이터 연결 (선택사항)
  if (process.env.REACT_APP_USE_AUTH_EMULATOR === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('✅ Auth 에뮬레이터에 연결되었습니다.');
    } catch (error) {
      if (error.message && !error.message.includes('already been connected')) {
        console.warn('⚠️ Auth 에뮬레이터 연결 실패:', error.message);
      }
    }
  }
} else {
  // 프로덕션 환경: 오프라인 지속성 활성화 (선택사항)
  // enableIndexedDbPersistence(db).catch((err) => {
  //   if (err.code === 'failed-precondition') {
  //     console.warn('오프라인 지속성은 여러 탭이 열려있을 때 사용할 수 없습니다.');
  //   } else if (err.code === 'unimplemented') {
  //     console.warn('브라우저가 오프라인 지속성을 지원하지 않습니다.');
  //   }
  // });
}

export default app;
