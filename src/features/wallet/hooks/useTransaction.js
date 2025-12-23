import { useState } from 'react';
import { transactionApi } from '../api/transactionApi';
import { useAuth } from '../../auth/hooks/useAuth';

export function useTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, refreshUser } = useAuth();

  const executeTransaction = async (productId, sellerId, amount) => {
    if (!user) {
      setError({ code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' });
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await transactionApi({
        senderId: user.uid,
        receiverId: sellerId,
        amount: amount,
        productId: productId
      });

      if (result.success) {
        // 사용자 정보 새로고침 (포인트 업데이트)
        await refreshUser();
        return { success: true, txId: result.txId };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = {
        code: 'TRANSACTION_ERROR',
        message: '거래 처리 중 오류가 발생했습니다.'
      };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { executeTransaction, loading, error };
}
