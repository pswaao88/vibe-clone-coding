import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';

export function useChat(roomId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (senderId, content) => {
    try {
      const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        senderId,
        content,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage };
}
