import React from 'react';
import { Loading } from '../../../shared/components/Loading';

export function PointLogList({ logs, loading }) {
  if (loading) {
    return <Loading />;
  }

  if (logs.length === 0) {
    return <div className="empty-state">거래 내역이 없습니다.</div>;
  }

  return (
    <div className="point-log-list">
      <h3>거래 내역</h3>
      {logs.map(log => (
        <div key={log.id} className="point-log-item">
          <div className="log-info">
            <div className="log-description">{log.description}</div>
            <div className="log-date">
              {log.createdAt?.toDate?.().toLocaleDateString() || '날짜 없음'}
            </div>
          </div>
          <div className="log-amount">
            {log.amount.toLocaleString()}원
          </div>
          <div className="log-balance">
            잔액: {log.balance.toLocaleString()}원
          </div>
        </div>
      ))}
    </div>
  );
}
