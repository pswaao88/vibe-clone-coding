import React from 'react';
import { Header } from './Header';

export function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
