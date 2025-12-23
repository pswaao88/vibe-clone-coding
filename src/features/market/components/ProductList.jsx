import React from 'react';
import { ProductCard } from './ProductCard';
import { Loading } from '../../../shared/components/Loading';

export function ProductList({ products, loading }) {
  if (loading) {
    return <Loading />;
  }

  if (products.length === 0) {
    return <div className="empty-state">등록된 상품이 없습니다.</div>;
  }

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
