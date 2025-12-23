import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../../shared/utils/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { Loading } from '../../../shared/components/Loading';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    profileImageUrl: user?.profileImageUrl || ''
  });

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase Auth 프로필 업데이트
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        });
      }

      // Firestore 사용자 정보 업데이트
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        profileImageUrl: formData.profileImageUrl,
        updatedAt: new Date()
      });

      // 사용자 정보 새로고침
      await refreshUser();

      alert('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="profile-page">
      <h2>프로필 수정</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="disabled-input"
          />
          <p className="form-hint">이메일은 변경할 수 없습니다.</p>
        </div>

        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label>프로필 이미지 URL</label>
          <input
            type="url"
            name="profileImageUrl"
            value={formData.profileImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          {formData.profileImageUrl && (
            <img
              src={formData.profileImageUrl}
              alt="Profile"
              className="profile-preview"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="form-group">
          <label>보유 포인트</label>
          <input
            type="text"
            value={user.point?.toLocaleString() || 0}
            disabled
            className="disabled-input"
          />
          <p className="form-hint">포인트는 지갑 페이지에서 충전할 수 있습니다.</p>
        </div>

        <div className="form-actions">
          <Button type="submit" primary>
            저장하기
          </Button>
        </div>
      </form>
    </div>
  );
}

