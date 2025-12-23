import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from './Button';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>중고거래 마켓</h1>
        </Link>
        <nav className="nav">
          <Link to="/market">상품</Link>
          {user && (
            <>
              <Link to="/my-products">내 상품</Link>
              <Link to="/chat">채팅</Link>
              <Link to="/wallet">포인트</Link>
              <Link to="/profile">{user.displayName || user.email}</Link>
              <Button onClick={handleLogout}>로그아웃</Button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
