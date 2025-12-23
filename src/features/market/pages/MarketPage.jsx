import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductList } from '../components/ProductList';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { useNavigate } from 'react-router-dom';

export function MarketPage() {
  const { products, loading } = useProducts('ON_SALE');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', '전자제품', '의류', '가구', '도서', '기타'];

  return (
    <div className="market-page">
      <div className="market-header">
        <h2>상품 목록</h2>
        {user && (
          <Button onClick={() => navigate('/products/upload')} primary>
            상품 등록
          </Button>
        )}
      </div>

      <div className="market-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="상품 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={categoryFilter === cat ? 'active' : ''}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'ALL' ? '전체' : cat}
            </button>
          ))}
        </div>
      </div>

      <p className="product-count">
        {filteredProducts.length}개의 상품
      </p>

      <ProductList products={filteredProducts} loading={loading} />
    </div>
  );
}
