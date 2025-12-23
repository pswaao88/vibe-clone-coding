import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ON_SALE':
        return '판매중';
      case 'RESERVED':
        return '예약중';
      case 'SOLD_OUT':
        return '판매완료';
      default:
        return status;
    }
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {product.images && product.images[0] && (
        <img src={product.images[0]} alt={product.title} className="product-image" />
      )}
      <div className="product-info">
        <h3>{product.title}</h3>
        <p className="price">{product.price?.toLocaleString()}원</p>
        <span className={`status status-${product.status?.toLowerCase()}`}>
          {getStatusText(product.status)}
        </span>
      </div>
    </div>
  );
}
