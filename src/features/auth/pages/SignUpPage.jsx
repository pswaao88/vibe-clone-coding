import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../shared/components/Button';

export function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      await signup(email, password, displayName);
      navigate('/market');
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="홍길동"
            />
          </div>
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호 (최소 6자)"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <Button type="submit" className="btn-primary btn-block">
            회원가입
          </Button>
        </form>
        <p className="auth-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
