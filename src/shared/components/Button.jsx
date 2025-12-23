import React from 'react';

export function Button({ onClick, disabled, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className}`}
    >
      {children}
    </button>
  );
}
