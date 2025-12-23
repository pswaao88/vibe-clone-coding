import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { useProductDetail } from '../hooks/useProductDetail';
import { useTransaction } from '../../wallet/hooks/useTransaction';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { Loading } from '../../../shared/components/Loading';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProductDetail(id);
  const { executeTransaction, loading: txLoading } = useTransaction();
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (user.uid === product.sellerId) {
      alert('본인의 상품은 구매할 수 없습니다.');
      return;
    }

    const confirmed = window.confirm(
      `${product.price.toLocaleString()}원을 결제하시겠습니까?`
    );

    if (!confirmed) return;

    const result = await executeTransaction(
      product.id,
      product.sellerId,
      product.price
    );

    if (result.success) {
      // 채팅방 생성 또는 찾기
      try {
        const chatRoomsRef = collection(db, 'chat_rooms');
        const q = query(
          chatRoomsRef,
          where('productId', '==', product.id),
          where('buyerId', '==', user.uid),
          where('sellerId', '==', product.sellerId)
        );
        
        const existingRooms = await getDocs(q);
        
        if (existingRooms.empty) {
          // 새 채팅방 생성
          await addDoc(chatRoomsRef, {
            productId: product.id,
            buyerId: user.uid,
            sellerId: product.sellerId,
            lastMessage: '',
            lastMessageAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        alert('구매가 완료되었습니다!');
        navigate(`/chat`);
      } catch (error) {
        console.error('채팅방 생성 오류:', error);
        alert('구매가 완료되었습니다! (채팅방 생성 실패)');
        navigate('/wallet');
      }
    } else {
      alert(result.error?.message || '구매에 실패했습니다.');
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="product-detail">
      {product.images && product.images[0] && (
        <img src={product.images[0]} alt={product.title} className="detail-image" />
      )}
      <div className="detail-info">
        <h1>{product.title}</h1>
        <p className="description">{product.description}</p>
        <div className="price">{product.price?.toLocaleString()}원</div>
        <div className="category">카테고리: {product.category}</div>

        {product.status === 'ON_SALE' && user?.uid !== product.sellerId && (
          <Button
            onClick={handlePurchase}
            disabled={txLoading}
            className="btn-primary"
          >
            {txLoading ? '처리 중...' : '구매하기'}
          </Button>
        )}
        {product.status !== 'ON_SALE' && (
          <div className="status-message">
            {product.status === 'RESERVED' ? '예약된 상품입니다.' : '판매 완료된 상품입니다.'}
          </div>
        )}
      </div>
    </div>
  );
}
