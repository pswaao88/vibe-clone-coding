import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { useAuth } from '../../auth/hooks/useAuth';
import { Loading } from '../../../shared/components/Loading';

export function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get('roomId');
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const chatRoomsRef = collection(db, 'chat_rooms');
    const q = query(
      chatRoomsRef,
      where('buyerId', '==', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const q2 = query(
      chatRoomsRef,
      where('sellerId', '==', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe1 = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatRooms(prev => {
        const sellerRooms = prev.filter(r => r.sellerId === user.uid);
        return [...rooms, ...sellerRooms];
      });
      setLoading(false);
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatRooms(prev => {
        const buyerRooms = prev.filter(r => r.buyerId === user.uid);
        return [...buyerRooms, ...rooms];
      });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user]);

  // URL에서 roomId가 있으면 해당 채팅방 선택
  useEffect(() => {
    if (roomIdFromUrl && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomIdFromUrl);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [roomIdFromUrl, chatRooms]);

  useEffect(() => {
    if (!selectedRoom) return;

    setRoomLoading(true);
    const messagesRef = collection(db, 'chat_rooms', selectedRoom.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesList);
      setRoomLoading(false);
    });

    return () => unsubscribe();
  }, [selectedRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoom) return;

    try {
      const messagesRef = collection(db, 'chat_rooms', selectedRoom.id, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        content: messageText,
        read: false,
        createdAt: serverTimestamp()
      });

      // 채팅방의 lastMessage 업데이트
      const roomRef = doc(db, 'chat_rooms', selectedRoom.id);
      await updateDoc(roomRef, {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp()
      });

      setMessageText('');
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const getOtherUser = (room) => {
    if (room.buyerId === user.uid) {
      return { id: room.sellerId, name: '판매자' };
    }
    return { id: room.buyerId, name: '구매자' };
  };

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-rooms">
          <h3>채팅 목록</h3>
          {loading ? (
            <Loading />
          ) : chatRooms.length === 0 ? (
            <p>채팅방이 없습니다.</p>
          ) : (
            <div className="room-list">
              {chatRooms.map(room => {
                const otherUser = getOtherUser(room);
                return (
                  <div
                    key={room.id}
                    className={`room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="room-info">
                      <h4>{room.productId ? `상품: ${room.productId}` : otherUser.name}</h4>
                      <p className="last-message">{room.lastMessage || '메시지가 없습니다.'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="chat-messages">
          {selectedRoom ? (
            <>
              <div className="messages-header">
                <h3>{getOtherUser(selectedRoom).name}와의 대화</h3>
                {selectedRoom.productId && (
                  <p className="product-link" onClick={() => window.location.href = `/products/${selectedRoom.productId}`}>
                    상품 보기
                  </p>
                )}
              </div>
              <div className="messages-list">
                {roomLoading ? (
                  <Loading />
                ) : messages.length === 0 ? (
                  <p>메시지가 없습니다.</p>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.senderId === user.uid ? 'sent' : 'received'}`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="message-form">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                />
                <button type="submit">전송</button>
              </form>
            </>
          ) : (
            <div className="no-room-selected">
              <p>채팅방을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
