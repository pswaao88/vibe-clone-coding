import React from 'react';

export function PointBalance({ point }) {
  return (
    <div className="point-balance">
      <h3>보유 포인트</h3>
      <div className="balance-amount">{point?.toLocaleString() || 0}원</div>
    </div>
  );
}
