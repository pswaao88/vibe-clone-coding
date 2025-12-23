import React, { useState } from 'react';
import { doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';

export function ChargeForm({ userId, onSuccess, onCancel }) {
  const { refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presetAmounts = [10000, 30000, 50000, 100000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseInt(amount) <= 0) {
      setError('유효한 금액을 입력해주세요.');
      return;
    }

    const chargeAmount = parseInt(amount);
    if (chargeAmount > 1000000) {
      setError('한 번에 1,000,000원 이상 충전할 수 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Firestore Transaction 사용
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('USER_NOT_FOUND');
        }

        const userData = userDoc.data();
        const currentBalance = userData.point || 0;
        const newBalance = currentBalance + chargeAmount;

        // 포인트 증가
        transaction.update(userRef, { point: newBalance });

        // point_logs 기록 - 고유 ID 생성
        const logId = `charge_${Date.now()}_${userId}`;
        const logRef = doc(db, 'point_logs', logId);
        transaction.set(logRef, {
          userId: userId,
          type: 'CHARGE',
          amount: chargeAmount,
          balance: newBalance,
          description: `포인트 충전: ${chargeAmount.toLocaleString()}원`,
          createdAt: serverTimestamp()
        });
      });

      // 사용자 정보 새로고침
      await refreshUser();
      
      alert('포인트가 충전되었습니다!');
      onSuccess();
    } catch (err) {
      console.error('충전 오류:', err);
      setError('충전에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="charge-form">
      <h3>포인트 충전</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>충전 금액 (원)</label>
          <div className="preset-amounts">
            {presetAmounts.map(preset => (
              <button
                key={preset}
                type="button"
                className="preset-button"
                onClick={() => setAmount(preset.toString())}
              >
                {preset.toLocaleString()}원
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="직접 입력"
            min="1"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <Button type="button" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" primary disabled={loading}>
            {loading ? '처리 중...' : '충전하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}

