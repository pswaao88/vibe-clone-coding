// 클라이언트 사이드 거래 API (Cloud Functions 없이)
// ⚠️ 보안 주의: 클라이언트에서 실행되므로 보안 규칙으로 보호해야 합니다.
import { runTransaction, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';

export const transactionApi = async (data) => {
  const { senderId, receiverId, amount, productId } = data;

  try {
    // Firestore Transaction 사용 (원자성 보장)
    const result = await runTransaction(db, async (transaction) => {
      // 1. Sender 조회
      const senderRef = doc(db, 'users', senderId);
      const senderDoc = await transaction.get(senderRef);
      
      if (!senderDoc.exists()) {
        throw new Error('SENDER_NOT_FOUND');
      }

      const senderData = senderDoc.data();
      const currentBalance = senderData.point || 0;

      // 2. 잔액 확인
      if (currentBalance < amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // 3. Receiver 조회
      const receiverRef = doc(db, 'users', receiverId);
      const receiverDoc = await transaction.get(receiverRef);
      
      if (!receiverDoc.exists()) {
        throw new Error('RECEIVER_NOT_FOUND');
      }

      const receiverData = receiverDoc.data();
      const receiverBalance = receiverData.point || 0;

      // 4. Product 조회 및 상태 확인
      const productRef = doc(db, 'products', productId);
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const productData = productDoc.data();
      if (productData.status !== 'ON_SALE') {
        throw new Error('PRODUCT_NOT_AVAILABLE');
      }

      // 5. 포인트 거래 실행
      const newSenderBalance = currentBalance - amount;
      const newReceiverBalance = receiverBalance + amount;

      transaction.update(senderRef, { point: newSenderBalance });
      transaction.update(receiverRef, { point: newReceiverBalance });

      // 6. point_logs 기록 (Sender) - 고유 ID 생성
      const senderLogId = `tx_${Date.now()}_${senderId}_sender`;
      const senderLogRef = doc(db, 'point_logs', senderLogId);
      transaction.set(senderLogRef, {
        userId: senderId,
        type: 'TRANSFER',
        amount: amount,
        balance: newSenderBalance,
        relatedUserId: receiverId,
        productId: productId,
        description: `상품 구매: ${productData.title}`,
        createdAt: serverTimestamp()
      });

      // 7. point_logs 기록 (Receiver) - 고유 ID 생성
      const receiverLogId = `tx_${Date.now()}_${receiverId}_receiver`;
      const receiverLogRef = doc(db, 'point_logs', receiverLogId);
      transaction.set(receiverLogRef, {
        userId: receiverId,
        type: 'TRANSFER',
        amount: amount,
        balance: newReceiverBalance,
        relatedUserId: senderId,
        productId: productId,
        description: `상품 판매: ${productData.title}`,
        createdAt: serverTimestamp()
      });

      // 8. Product 상태 변경
      transaction.update(productRef, {
        status: 'SOLD_OUT',
        updatedAt: serverTimestamp()
      });

      return senderLogId;
    });

    return {
      success: true,
      txId: result,
      message: '거래가 완료되었습니다.'
    };
  } catch (error) {
    console.error('Transaction error:', error);
    
    const errorCode = error.message || 'TRANSACTION_FAILED';
    let errorMessage = '거래 처리 중 오류가 발생했습니다.';
    
    if (errorCode === 'INSUFFICIENT_BALANCE') {
      errorMessage = '잔액이 부족합니다.';
    } else if (errorCode === 'PRODUCT_NOT_FOUND') {
      errorMessage = '상품을 찾을 수 없습니다.';
    } else if (errorCode === 'PRODUCT_NOT_AVAILABLE') {
      errorMessage = '판매 가능한 상품이 아닙니다.';
    } else if (errorCode === 'SENDER_NOT_FOUND' || errorCode === 'RECEIVER_NOT_FOUND') {
      errorMessage = '사용자를 찾을 수 없습니다.';
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    };
  }
};
