import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePointLogs } from '../hooks/usePointLogs';
import { PointBalance } from '../components/PointBalance';
import { PointLogList } from '../components/PointLogList';
import { ChargeForm } from '../components/ChargeForm';
import { Button } from '../../../shared/components/Button';

export function WalletPage() {
  const { user, refreshUser } = useAuth();
  const { logs, loading } = usePointLogs(user?.uid);
  const [showChargeForm, setShowChargeForm] = useState(false);

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  const handleChargeSuccess = async () => {
    setShowChargeForm(false);
    await refreshUser();
  };

  return (
    <div className="wallet-page">
      <h2>내 지갑</h2>
      <PointBalance point={user.point} />
      
      <div className="wallet-actions">
        <Button onClick={() => setShowChargeForm(!showChargeForm)} primary>
          {showChargeForm ? '충전 취소' : '포인트 충전'}
        </Button>
      </div>

      {showChargeForm && (
        <ChargeForm
          userId={user.uid}
          onSuccess={handleChargeSuccess}
          onCancel={() => setShowChargeForm(false)}
        />
      )}

      <h3>거래 내역</h3>
      <PointLogList logs={logs} loading={loading} />
    </div>
  );
}
