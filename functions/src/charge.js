const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('./utils/firebaseAdmin');

setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

exports.charge = onRequest(async (req, res) => {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'POST 메서드만 허용됩니다.' }
    });
    return;
  }

  try {
    // 1. 인증 확인
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증 토큰이 필요합니다.' }
      });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { userId, amount } = req.body;

    // 2. 입력값 검증
    if (!userId || !amount) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '필수 필드가 누락되었습니다.' }
      });
      return;
    }

    if (userId !== decodedToken.uid) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: '본인만 충전할 수 있습니다.' }
      });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: '유효하지 않은 금액입니다.' }
      });
      return;
    }

    // 3. Firestore Transaction 실행
    const db = admin.firestore();
    const result = await db.runTransaction(async (transaction) => {
      // 3-1. 사용자 조회
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('USER_NOT_FOUND');
      }

      const userData = userDoc.data();
      const newBalance = (userData.point || 0) + amount;

      // 3-2. 포인트 증가
      transaction.update(userRef, { point: newBalance });

      // 3-3. point_logs 기록
      const logRef = db.collection('point_logs').doc();
      transaction.set(logRef, {
        userId: userId,
        type: 'CHARGE',
        amount: amount,
        balance: newBalance,
        description: `포인트 충전: ${amount.toLocaleString()}원`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return logRef.id;
    });

    // 4. 성공 응답
    res.status(200).json({
      success: true,
      txId: result,
      message: '포인트가 충전되었습니다.'
    });

  } catch (error) {
    console.error('Charge error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: error.message || 'CHARGE_FAILED',
        message: error.message || '충전 처리 중 오류가 발생했습니다.'
      }
    });
  }
});

