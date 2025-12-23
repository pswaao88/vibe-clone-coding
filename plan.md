# 🏗️ 프로젝트 설계도 (Project Architecture Plan)

## 📋 목차
1. [공통 규약](#공통-규약)
2. [Agent 1: 데이터베이스 & 보안 관리자](#agent-1-데이터베이스--보안-관리자)
3. [Agent 2: 핵심 비즈니스 로직 처리자](#agent-2-핵심-비즈니스-로직-처리자)
4. [Agent 3: 사용자 경험 & 인터페이스 개발자](#agent-3-사용자-경험--인터페이스-개발자)
5. [Sub-Agent 작업 지시서](#sub-agent-작업-지시서)

---

## 🛠️ 공통 규약 (Shared Contracts)

### 네이밍 컨벤션

| 항목 | 규칙 | 예시 |
|------|------|------|
| 변수/필드명 | camelCase | `userId`, `profileImageUrl` |
| 컬렉션(DB)명 | snake_case 복수형 | `users`, `products`, `chat_rooms` |
| 상태값(Enum) | UPPER_CASE | `SALE`, `SOLD_OUT`, `RESERVED` |

### 기술 스택 표준

- **Language**: JavaScript (ES6+)
- **Frontend Deployment**: Netlify
- **Backend Deployment**: Firebase Cloud Functions (Node.js)
- **Frontend Framework**: React
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

---

## 👮 Agent 1: 데이터베이스 & 보안 관리자

### 1.1 Firestore 스키마 정의

#### 📊 Collection: `users`

```javascript
{
  uid: string,              // Primary Key (Firebase Auth UID)
  email: string,
  displayName: string,
  profileImageUrl: string,
  point: number,            // 🔒 보안필드 (클라이언트 수정 불가)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**인덱스 설정:**
- `uid` (단일 필드 인덱스)

---

#### 📦 Collection: `products`

```javascript
{
  id: string,               // Auto-generated Document ID
  sellerId: string,         // users.uid 참조
  title: string,
  description: string,
  price: number,            // 정수형 (원 단위)
  status: string,          // 'ON_SALE' | 'RESERVED' | 'SOLD_OUT'
  images: string[],        // 이미지 URL 배열
  category: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**인덱스 설정:**
- `status` (단일 필드 인덱스)
- `sellerId` (단일 필드 인덱스)
- `status + createdAt` (복합 인덱스, 내림차순)

---

#### 💰 Collection: `point_logs`

```javascript
{
  id: string,               // Auto-generated Document ID
  userId: string,           // users.uid 참조
  type: string,            // 'CHARGE' | 'TRANSFER'
  amount: number,          // 양수 (절대값)
  balance: number,         // 거래 후 잔액
  relatedUserId: string,   // TRANSFER인 경우 상대방 UID (선택)
  productId: string,       // TRANSFER인 경우 거래 상품 ID (선택)
  description: string,
  createdAt: timestamp
}
```

**인덱스 설정:**
- `userId + createdAt` (복합 인덱스, 내림차순)
- `type` (단일 필드 인덱스)

---

#### 💬 Collection: `chat_rooms`

```javascript
{
  id: string,               // Auto-generated Document ID
  productId: string,        // products.id 참조
  buyerId: string,          // users.uid 참조
  sellerId: string,         // users.uid 참조
  lastMessage: string,
  lastMessageAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**인덱스 설정:**
- `buyerId + lastMessageAt` (복합 인덱스, 내림차순)
- `sellerId + lastMessageAt` (복합 인덱스, 내림차순)

---

#### 📨 Collection: `messages` (Sub-collection of `chat_rooms`)

```javascript
{
  id: string,               // Auto-generated Document ID
  senderId: string,         // users.uid 참조
  content: string,
  read: boolean,
  createdAt: timestamp
}
```

**인덱스 설정:**
- `createdAt` (단일 필드 인덱스, 오름차순)

---

### 1.2 Firestore Security Rules

**파일 위치**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isParticipant(roomId) {
      return isAuthenticated() && (
        get(/databases/$(database)/documents/chat_rooms/$(roomId)).data.buyerId == request.auth.uid ||
        get(/databases/$(database)/documents/chat_rooms/$(roomId)).data.sellerId == request.auth.uid
      );
    }
    
    // Collection: users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) && 
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['point']);
      allow delete: if false; // 사용자 삭제는 관리자만 가능
    }
    
    // Collection: products
    match /products/{productId} {
      allow read: if true; // 누구나 읽기 가능
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                       resource.data.sellerId == request.auth.uid;
      allow delete: if isAuthenticated() && 
                       resource.data.sellerId == request.auth.uid;
    }
    
    // Collection: point_logs
    match /point_logs/{logId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // 서버(Firebase Cloud Functions)에서만 작성 가능
    }
    
    // Collection: chat_rooms
    match /chat_rooms/{roomId} {
      allow read: if isParticipant(roomId);
      allow create: if isAuthenticated();
      allow update: if isParticipant(roomId);
      allow delete: if false;
      
      // Sub-collection: messages
      match /messages/{messageId} {
        allow read: if isParticipant(roomId);
        allow create: if isParticipant(roomId);
        allow update: if isParticipant(roomId) && 
                         resource.data.senderId == request.auth.uid;
        allow delete: if false;
      }
    }
  }
}
```

---

### 1.3 더미 데이터 구조

**Agent 1이 생성할 초기 데이터:**

```javascript
// users 더미 데이터
const dummyUsers = [
  {
    uid: "user1",
    email: "seller@example.com",
    displayName: "판매자1",
    profileImageUrl: "https://...",
    point: 50000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uid: "user2",
    email: "buyer@example.com",
    displayName: "구매자1",
    profileImageUrl: "https://...",
    point: 30000,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// products 더미 데이터
const dummyProducts = [
  {
    sellerId: "user1",
    title: "중고 노트북",
    description: "잘 사용하던 노트북입니다.",
    price: 500000,
    status: "ON_SALE",
    images: ["https://..."],
    category: "전자제품",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
```

---

## 🧠 Agent 2: 핵심 비즈니스 로직 처리자

### 2.1 Firebase Cloud Functions 구조

**디렉토리 구조:**
```
functions/
├── src/
│   ├── index.js               # Functions 진입점
│   ├── transaction.js          # 포인트 거래 API
│   ├── charge.js              # 포인트 충전 API (선택)
│   └── utils/
│       ├── firebaseAdmin.js    # Firebase Admin SDK 초기화
│       └── validators.js       # 입력값 검증
├── package.json
└── .env                        # 환경 변수 (로컬 개발용)
```

---

### 2.2 API 명세: `/api/transaction`

#### Endpoint
```
POST https://{region}-{project-id}.cloudfunctions.net/transaction
```
또는
```
POST https://us-central1-{project-id}.cloudfunctions.net/transaction
```

#### Request Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <Firebase ID Token>"
}
```

#### Request Body
```javascript
{
  "senderId": string,      // 구매자 UID
  "receiverId": string,    // 판매자 UID
  "amount": number,        // 거래 금액 (양수)
  "productId": string      // 상품 ID
}
```

#### Response (Success)
```javascript
{
  "success": true,
  "txId": string,          // 거래 로그 ID
  "message": "거래가 완료되었습니다."
}
```

#### Response (Error)
```javascript
{
  "success": false,
  "error": {
    "code": string,        // 에러 코드
    "message": string      // 에러 메시지
  }
}
```

#### 에러 코드
- `INSUFFICIENT_BALANCE`: 잔액 부족
- `INVALID_AMOUNT`: 잘못된 금액
- `PRODUCT_NOT_FOUND`: 상품을 찾을 수 없음
- `PRODUCT_NOT_AVAILABLE`: 상품이 판매 불가 상태
- `UNAUTHORIZED`: 인증 실패
- `TRANSACTION_FAILED`: 거래 실패

---

### 2.3 구현 로직 (transaction.js)

```javascript
// functions/src/transaction.js
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('./utils/firebaseAdmin');
const { validateTransaction } = require('./utils/validators');

// 전역 옵션 설정 (CORS, 리전 등)
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1', // 또는 'asia-northeast3' (서울)
});

exports.transaction = onRequest(async (req, res) => {
  // CORS 헤더 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'POST 메서드만 허용됩니다.' }
    });
    return;
  }

  try {
    // 1. 인증 확인
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증 토큰이 필요합니다.' }
      });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { senderId, receiverId, amount, productId } = req.body;

    // 2. 입력값 검증
    const validation = validateTransaction(req.body, decodedToken.uid);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error
      });
      return;
    }

    // 3. Firestore Transaction 실행
    const db = admin.firestore();
    const result = await db.runTransaction(async (transaction) => {
      // 3-1. Sender 잔액 조회
      const senderRef = db.collection('users').doc(senderId);
      const senderDoc = await transaction.get(senderRef);
      
      if (!senderDoc.exists) {
        throw new Error('SENDER_NOT_FOUND');
      }

      const senderData = senderDoc.data();
      if (senderData.point < amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // 3-2. Receiver 조회
      const receiverRef = db.collection('users').doc(receiverId);
      const receiverDoc = await transaction.get(receiverRef);
      
      if (!receiverDoc.exists) {
        throw new Error('RECEIVER_NOT_FOUND');
      }

      // 3-3. Product 조회 및 상태 확인
      const productRef = db.collection('products').doc(productId);
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const productData = productDoc.data();
      if (productData.status !== 'ON_SALE') {
        throw new Error('PRODUCT_NOT_AVAILABLE');
      }

      // 3-4. 포인트 거래 실행
      const newSenderPoint = senderData.point - amount;
      const newReceiverPoint = receiverDoc.data().point + amount;

      transaction.update(senderRef, { point: newSenderPoint });
      transaction.update(receiverRef, { point: newReceiverPoint });

      // 3-5. point_logs 기록 (Sender)
      const senderLogRef = db.collection('point_logs').doc();
      transaction.set(senderLogRef, {
        userId: senderId,
        type: 'TRANSFER',
        amount: amount,
        balance: newSenderPoint,
        relatedUserId: receiverId,
        productId: productId,
        description: `상품 구매: ${productData.title}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3-6. point_logs 기록 (Receiver)
      const receiverLogRef = db.collection('point_logs').doc();
      transaction.set(receiverLogRef, {
        userId: receiverId,
        type: 'TRANSFER',
        amount: amount,
        balance: newReceiverPoint,
        relatedUserId: senderId,
        productId: productId,
        description: `상품 판매: ${productData.title}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3-7. Product 상태 변경
      transaction.update(productRef, {
        status: 'SOLD_OUT',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return senderLogRef.id;
    });

    // 4. 성공 응답
    res.status(200).json({
      success: true,
      txId: result,
      message: '거래가 완료되었습니다.'
    });

  } catch (error) {
    console.error('Transaction error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: error.message || 'TRANSACTION_FAILED',
        message: error.message || '거래 처리 중 오류가 발생했습니다.'
      }
    });
  }
});
```

---

### 2.4 Firebase Admin SDK 초기화

**파일**: `functions/src/utils/firebaseAdmin.js`

```javascript
const admin = require('firebase-admin');

// Firebase Cloud Functions에서는 자동으로 초기화됨
// 로컬 개발 환경에서만 수동 초기화 필요
if (!admin.apps.length) {
  admin.initializeApp();
}

module.exports = admin;
```

**참고**: Firebase Cloud Functions에서는 프로젝트가 이미 초기화되어 있으므로 별도의 인증 정보 설정이 필요 없습니다. 로컬 개발 시에는 `firebase emulators:start` 또는 `firebase use` 명령으로 프로젝트를 설정합니다.

---

### 2.5 Functions 진입점 (index.js)

**파일**: `functions/src/index.js`

```javascript
const { transaction } = require('./transaction');
// const { charge } = require('./charge'); // 선택 사항

exports.transaction = transaction;
// exports.charge = charge;
```

---

### 2.6 입력값 검증 유틸리티

**파일**: `functions/src/utils/validators.js`

```javascript
function validateTransaction(data, authenticatedUserId) {
  const { senderId, receiverId, amount, productId } = data;

  // 본인만 거래 가능
  if (senderId !== authenticatedUserId) {
    return {
      valid: false,
      error: { code: 'UNAUTHORIZED', message: '본인만 거래할 수 있습니다.' }
    };
  }

  // 필수 필드 확인
  if (!senderId || !receiverId || !amount || !productId) {
    return {
      valid: false,
      error: { code: 'INVALID_INPUT', message: '필수 필드가 누락되었습니다.' }
    };
  }

  // 금액 검증
  if (typeof amount !== 'number' || amount <= 0) {
    return {
      valid: false,
      error: { code: 'INVALID_AMOUNT', message: '유효하지 않은 금액입니다.' }
    };
  }

  // 자기 자신에게 전송 불가
  if (senderId === receiverId) {
    return {
      valid: false,
      error: { code: 'INVALID_RECEIVER', message: '자기 자신에게는 전송할 수 없습니다.' }
    };
  }

  return { valid: true };
}

module.exports = { validateTransaction };
```

---

## 🎨 Agent 3: 사용자 경험 & 인터페이스 개발자

### 3.1 디렉토리 구조

```
src/
├── features/                    # 기능 단위 모듈
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignUpForm.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       └── SignUpPage.jsx
│   │
│   ├── market/
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── ProductUpload.jsx
│   │   ├── hooks/
│   │   │   ├── useProducts.js
│   │   │   └── useProductDetail.js
│   │   └── pages/
│   │       ├── MarketPage.jsx
│   │       └── ProductDetailPage.jsx
│   │
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatRoomList.jsx
│   │   │   ├── ChatRoom.jsx
│   │   │   └── MessageItem.jsx
│   │   ├── hooks/
│   │   │   └── useChat.js
│   │   └── pages/
│   │       └── ChatPage.jsx
│   │
│   └── wallet/
│       ├── components/
│       │   ├── PointBalance.jsx
│       │   ├── PointLogList.jsx
│       │   └── ChargeForm.jsx
│       ├── hooks/
│       │   └── usePointLogs.js
│       └── api/
│           └── transactionApi.js
│
├── shared/                      # 공용 컴포넌트
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   └── Loading.jsx
│   └── utils/
│       ├── firebase.js          # Firebase 클라이언트 초기화
│       └── constants.js         # 상수 정의
│
├── App.jsx
├── index.js
└── index.css
```

---

### 3.2 핵심 Custom Hooks

#### useTransaction Hook

**파일**: `src/features/wallet/hooks/useTransaction.js`

```javascript
import { useState } from 'react';
import { transactionApi } from '../api/transactionApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export function useTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, getIdToken } = useAuth();

  const executeTransaction = async (productId, sellerId, amount) => {
    if (!user) {
      setError({ code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' });
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const result = await transactionApi({
        senderId: user.uid,
        receiverId: sellerId,
        amount: amount,
        productId: productId
      }, token);

      if (result.success) {
        return { success: true, txId: result.txId };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const error = {
        code: 'NETWORK_ERROR',
        message: '네트워크 오류가 발생했습니다.'
      };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { executeTransaction, loading, error };
}
```

---

#### useProducts Hook

**파일**: `src/features/market/hooks/useProducts.js`

```javascript
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';

export function useProducts(status = 'ON_SALE') {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status]);

  return { products, loading, error };
}
```

---

#### useChat Hook

**파일**: `src/features/chat/hooks/useChat.js`

```javascript
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
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
```

---

### 3.3 Transaction API 클라이언트

**파일**: `src/features/wallet/api/transactionApi.js`

```javascript
// Firebase Cloud Functions 엔드포인트
const FUNCTIONS_URL = process.env.REACT_APP_FUNCTIONS_URL || 
  'https://us-central1-your-project-id.cloudfunctions.net';

export const transactionApi = async (data, token) => {
  const response = await fetch(`${FUNCTIONS_URL}/transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  return result;
};
```

---

### 3.4 주요 컴포넌트 예시

#### ProductCard.jsx

```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <img src={product.images[0]} alt={product.title} />
      <h3>{product.title}</h3>
      <p className="price">{product.price.toLocaleString()}원</p>
      <span className={`status status-${product.status.toLowerCase()}`}>
        {product.status === 'ON_SALE' ? '판매중' : 
         product.status === 'RESERVED' ? '예약중' : '판매완료'}
      </span>
    </div>
  );
}
```

---

#### ProductDetailPage.jsx

```javascript
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';
import { useTransaction } from '../../wallet/hooks/useTransaction';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProductDetail(id);
  const { executeTransaction, loading: txLoading } = useTransaction();
  const { user } = useAuth();
  const [message, setMessage] = useState('');

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
      // 채팅방으로 이동 또는 생성
      navigate(`/chat/${product.id}`);
    } else {
      alert(result.error?.message || '구매에 실패했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!product) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="product-detail">
      <img src={product.images[0]} alt={product.title} />
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <div className="price">{product.price.toLocaleString()}원</div>
      
      {product.status === 'ON_SALE' && user?.uid !== product.sellerId && (
        <Button 
          onClick={handlePurchase} 
          disabled={txLoading}
        >
          {txLoading ? '처리 중...' : '구매하기'}
        </Button>
      )}
    </div>
  );
}
```

---

## 🚀 Sub-Agent 작업 지시서

### 작업 순서 및 의존성

```
[Phase 1] Agent 1: 데이터베이스 & 보안 설정
    ↓
[Phase 2] Agent 2: 백엔드 API 구현
    ↓
[Phase 3] Agent 3: 프론트엔드 개발
```

---

### 📝 Agent 1 작업 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] Firestore 데이터베이스 초기화
- [ ] `firestore.rules` 파일 작성 및 배포
- [ ] Firestore 인덱스 설정 (콘솔 또는 `firestore.indexes.json`)
- [ ] 더미 데이터 생성 스크립트 작성
- [ ] `users` 컬렉션에 더미 데이터 주입
- [ ] `products` 컬렉션에 더미 데이터 주입
- [ ] Security Rules 테스트 (Firebase Console)

**예상 소요 시간**: 2-3시간

---

### 📝 Agent 2 작업 체크리스트

- [ ] Firebase 프로젝트에 Cloud Functions 활성화
- [ ] Firebase CLI 설치 및 로그인 (`npm install -g firebase-tools`, `firebase login`)
- [ ] Functions 디렉토리 초기화 (`firebase init functions`)
- [ ] Firebase Admin SDK 설정
  - [ ] `functions/src/utils/firebaseAdmin.js` 작성
- [ ] `functions/src/utils/validators.js` 작성
- [ ] `functions/src/transaction.js` 구현
- [ ] `functions/src/index.js`에 함수 export
- [ ] `functions/package.json` 의존성 확인
- [ ] 로컬 테스트 환경 구축 (`firebase emulators:start`)
- [ ] Postman/Thunder Client로 API 테스트
  - [ ] 정상 케이스 테스트
  - [ ] 에러 케이스 테스트 (잔액 부족, 인증 실패 등)
- [ ] CORS 설정 확인
- [ ] Firebase Cloud Functions 배포 (`firebase deploy --only functions`)

**예상 소요 시간**: 3-4시간

---

### 📝 Agent 3 작업 체크리스트

- [ ] React 프로젝트 초기화 (`create-react-app` 또는 `Vite`)
- [ ] Firebase 클라이언트 SDK 설정
  - [ ] `src/shared/utils/firebase.js` 작성
  - [ ] 환경 변수 설정 (`.env`)
- [ ] 라우팅 설정 (`react-router-dom`)
- [ ] 공용 컴포넌트 구현
  - [ ] `Button.jsx`
  - [ ] `Header.jsx`
  - [ ] `Layout.jsx`
- [ ] 인증 기능 구현
  - [ ] `useAuth.js` Hook
  - [ ] `LoginPage.jsx`, `SignUpPage.jsx`
- [ ] 마켓 기능 구현
  - [ ] `useProducts.js` Hook
  - [ ] `ProductCard.jsx`, `ProductList.jsx`
  - [ ] `ProductDetailPage.jsx`
  - [ ] `ProductUpload.jsx` (선택)
- [ ] 거래 기능 연결
  - [ ] `transactionApi.js` 작성 (Firebase Cloud Functions URL 설정)
  - [ ] `useTransaction.js` Hook
  - [ ] '구매하기' 버튼 연동
- [ ] 채팅 기능 구현
  - [ ] `useChat.js` Hook
  - [ ] `ChatRoom.jsx`, `ChatRoomList.jsx`
- [ ] 포인트 조회 기능
  - [ ] `usePointLogs.js` Hook
  - [ ] `PointBalance.jsx`, `PointLogList.jsx`
- [ ] UI/UX 개선 및 스타일링
- [ ] Netlify 배포 설정
  - [ ] `netlify.toml` 작성 (빌드 설정)
  - [ ] Netlify 대시보드에서 환경 변수 설정
  - [ ] 배포 테스트
- [ ] 통합 테스트

**예상 소요 시간**: 5-6시간

---

### 🔗 통합 테스트 시나리오

1. **사용자 인증**
   - 회원가입 → 로그인 → 로그아웃

2. **상품 조회**
   - 상품 리스트 조회
   - 상품 상세 페이지 조회

3. **포인트 거래**
   - 구매하기 버튼 클릭
   - 거래 완료 확인
   - 포인트 잔액 확인
   - 거래 내역 확인

4. **채팅**
   - 거래 후 채팅방 자동 생성
   - 메시지 송수신

5. **보안 테스트**
   - 비인증 사용자 접근 차단
   - 타인의 포인트 수정 시도 차단
   - 타인의 거래 내역 조회 차단

---

## 📦 환경 변수 설정

### Firebase Cloud Functions 환경 변수

Firebase Cloud Functions는 프로젝트 설정을 자동으로 사용하므로 별도의 환경 변수 설정이 필요 없습니다.  
로컬 개발 시에는 `.firebaserc`와 `firebase.json`에서 프로젝트를 지정합니다.

**로컬 개발용 환경 변수 (선택 사항)**
```bash
# functions/.env (로컬 개발용)
FIREBASE_PROJECT_ID=your-project-id
```

### React 클라이언트 환경 변수

**파일**: `.env` (프로젝트 루트)

```bash
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Cloud Functions URL
REACT_APP_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
```

### Netlify 배포 환경 변수

Netlify 대시보드에서 다음 환경 변수를 설정합니다:

```bash
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
```

---

## 📚 참고 자료

- [Firebase Firestore 문서](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules 문서](https://firebase.google.com/docs/rules)
- [Firebase Cloud Functions 문서](https://firebase.google.com/docs/functions)
- [Firebase CLI 문서](https://firebase.google.com/docs/cli)
- [Netlify 배포 문서](https://docs.netlify.com/)
- [React 문서](https://react.dev/)

---

---

## 🚢 배포 구조

### 프론트엔드 배포 (Netlify)

1. **Netlify 프로젝트 생성**
   - Netlify 대시보드에서 새 사이트 생성
   - GitHub 저장소 연결 (또는 수동 배포)

2. **빌드 설정**
   - Build command: `npm run build`
   - Publish directory: `build` (Create React App) 또는 `dist` (Vite)

3. **환경 변수 설정**
   - Netlify 대시보드 → Site settings → Environment variables
   - 모든 `REACT_APP_*` 변수 추가

4. **배포**
   - 자동 배포: Git push 시 자동 배포
   - 수동 배포: Netlify CLI 사용 (`netlify deploy --prod`)

### 백엔드 배포 (Firebase Cloud Functions)

1. **Firebase CLI 설정**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions
   ```

2. **Functions 배포**
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

3. **배포 확인**
   - Firebase Console → Functions 탭에서 확인
   - 함수 URL 확인 및 테스트

**작성일**: 2024년
**버전**: 2.0.0 (Firebase Cloud Functions 배포 구조로 업데이트)

