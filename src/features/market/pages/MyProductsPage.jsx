import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { useAuth } from '../../auth/hooks/useAuth';
import { ProductList } from '../components/ProductList';
import { Loading } from '../../../shared/components/Loading';

export function MyProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!user) return;

    const productsRef = collection(db, 'products');
    let q = query(
      productsRef,
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 상태 필터 적용
        if (statusFilter !== 'ALL') {
          productsList = productsList.filter(p => p.status === statusFilter);
        }

        setProducts(productsList);
        setLoading(false);
      },
      (err) => {
        console.error('상품 조회 오류:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, statusFilter]);

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className="my-products-page">
      <h2>내 상품 관리</h2>
      
      <div className="status-filter">
        <button
          className={statusFilter === 'ALL' ? 'active' : ''}
          onClick={() => setStatusFilter('ALL')}
        >
          전체
        </button>
        <button
          className={statusFilter === 'ON_SALE' ? 'active' : ''}
          onClick={() => setStatusFilter('ON_SALE')}
        >
          판매중
        </button>
        <button
          className={statusFilter === 'RESERVED' ? 'active' : ''}
          onClick={() => setStatusFilter('RESERVED')}
        >
          예약중
        </button>
        <button
          className={statusFilter === 'SOLD_OUT' ? 'active' : ''}
          onClick={() => setStatusFilter('SOLD_OUT')}
        >
          판매완료
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <p className="product-count">총 {products.length}개의 상품</p>
          <ProductList products={products} loading={false} />
        </>
      )}
    </div>
  );
}

