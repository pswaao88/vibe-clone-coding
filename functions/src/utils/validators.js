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
