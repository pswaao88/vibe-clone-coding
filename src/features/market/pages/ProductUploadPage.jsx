import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../shared/utils/firebase';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { Loading } from '../../../shared/components/Loading';

export function ProductUploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '전자제품',
    images: []
  });
  const [imageUrls, setImageUrls] = useState([]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newUrls = files.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...newUrls]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.images.length === 0) {
      alert('최소 1개 이상의 이미지를 업로드해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 이미지 URL 배열 (실제로는 Firebase Storage에 업로드해야 함)
      // 여기서는 임시로 placeholder 사용
      const imageUrlArray = imageUrls.length > 0 
        ? imageUrls 
        : ['https://via.placeholder.com/400x300'];

      const productData = {
        sellerId: user.uid,
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        category: formData.category,
        status: 'ON_SALE',
        images: imageUrlArray,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'products'), productData);
      
      alert('상품이 등록되었습니다!');
      navigate('/market');
    } catch (error) {
      console.error('상품 등록 오류:', error);
      alert('상품 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="product-upload-page">
      <h2>상품 등록</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>상품 제목 *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="상품 제목을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label>상품 설명 *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="상품에 대한 자세한 설명을 입력하세요"
            rows="5"
            required
          />
        </div>

        <div className="form-group">
          <label>가격 (원) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>카테고리</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="전자제품">전자제품</option>
            <option value="의류">의류</option>
            <option value="가구">가구</option>
            <option value="도서">도서</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className="form-group">
          <label>상품 이미지 *</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          {imageUrls.length > 0 && (
            <div className="image-preview">
              {imageUrls.map((url, index) => (
                <div key={index} className="preview-item">
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button type="button" onClick={() => navigate('/market')}>
            취소
          </Button>
          <Button type="submit" primary>
            등록하기
          </Button>
        </div>
      </form>
    </div>
  );
}

