const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('./utils/firebaseAdmin');
const { validateTransaction } = require('./utils/validators');

// 전역 옵션 설정 (CORS, 리전 등)
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

exports.transaction = onRequest(async (req, res) => {
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
    const { senderId, receiverId, amount, productId } = req.body;

    // 2. 입력값 검증
    const validation = validateTransaction(req.body, decodedToken.uid);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error
      });
      return;
    }

    // 3. Firestore Transaction 실행
    const db = admin.firestore();
    const result = await db.runTransaction(async (transaction) => {
      // 3-1. Sender 잔액 조회
      const senderRef = db.collection('users').doc(senderId);
      const senderDoc = await transaction.get(senderRef);

      if (!senderDoc.exists) {
        throw new Error('SENDER_NOT_FOUND');
      }

      const senderData = senderDoc.data();
      if (senderData.point < amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // 3-2. Receiver 조회
      const receiverRef = db.collection('users').doc(receiverId);
      const receiverDoc = await transaction.get(receiverRef);

      if (!receiverDoc.exists) {
        throw new Error('RECEIVER_NOT_FOUND');
      }

      // 3-3. Product 조회 및 상태 확인
      const productRef = db.collection('products').doc(productId);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const productData = productDoc.data();
      if (productData.status !== 'ON_SALE') {
        throw new Error('PRODUCT_NOT_AVAILABLE');
      }

      // 3-4. 포인트 거래 실행
      const newSenderPoint = senderData.point - amount;
      const newReceiverPoint = receiverDoc.data().point + amount;

      transaction.update(senderRef, { point: newSenderPoint });
      transaction.update(receiverRef, { point: newReceiverPoint });

      // 3-5. point_logs 기록 (Sender)
      const senderLogRef = db.collection('point_logs').doc();
      transaction.set(senderLogRef, {
        userId: senderId,
        type: 'TRANSFER',
        amount: amount,
        balance: newSenderPoint,
        relatedUserId: receiverId,
        productId: productId,
        description: `상품 구매: ${productData.title}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3-6. point_logs 기록 (Receiver)
      const receiverLogRef = db.collection('point_logs').doc();
      transaction.set(receiverLogRef, {
        userId: receiverId,
        type: 'TRANSFER',
        amount: amount,
        balance: newReceiverPoint,
        relatedUserId: senderId,
        productId: productId,
        description: `상품 판매: ${productData.title}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3-7. Product 상태 변경
      transaction.update(productRef, {
        status: 'SOLD_OUT',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return senderLogRef.id;
    });

    // 4. 성공 응답
    res.status(200).json({
      success: true,
      txId: result,
      message: '거래가 완료되었습니다.'
    });

  } catch (error) {
    console.error('Transaction error:', error);

    res.status(500).json({
      success: false,
      error: {
        code: error.message || 'TRANSACTION_FAILED',
        message: error.message || '거래 처리 중 오류가 발생했습니다.'
      }
    });
  }
});
