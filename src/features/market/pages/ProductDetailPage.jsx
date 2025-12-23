import React, { useState } from 'react';
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
  const [chatLoading, setChatLoading] = useState(false);

  const handleChat = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (user.uid === product.sellerId) {
      alert('본인의 상품에는 채팅할 수 없습니다.');
      return;
    }

    setChatLoading(true);
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
        const newRoomData = {
          productId: product.id,
          buyerId: user.uid,
          sellerId: product.sellerId,
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const newRoomRef = await addDoc(chatRoomsRef, newRoomData);
        console.log('채팅방 생성 성공:', newRoomRef.id);
        navigate(`/chat?roomId=${newRoomRef.id}`);
      } else {
        // 기존 채팅방으로 이동
        const roomId = existingRooms.docs[0].id;
        console.log('기존 채팅방 발견:', roomId);
        navigate(`/chat?roomId=${roomId}`);
      }
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      alert(`채팅방 생성에 실패했습니다: ${error.message}`);
    } finally {
      setChatLoading(false);
    }
  };

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
      alert('구매가 완료되었습니다!');
      navigate('/wallet');
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

        <div className="product-actions">
          {user?.uid !== product.sellerId && (
            <>
              <Button
                onClick={handleChat}
                disabled={chatLoading}
                className="btn-secondary"
                style={{ marginRight: '10px' }}
              >
                {chatLoading ? '처리 중...' : '채팅하기'}
              </Button>
              {product.status === 'ON_SALE' && (
                <Button
                  onClick={handlePurchase}
                  disabled={txLoading}
                  className="btn-primary"
                >
                  {txLoading ? '처리 중...' : '구매하기'}
                </Button>
              )}
            </>
          )}
          {product.status !== 'ON_SALE' && user?.uid !== product.sellerId && (
            <div className="status-message">
              {product.status === 'RESERVED' ? '예약된 상품입니다.' : '판매 완료된 상품입니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
