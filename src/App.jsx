import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/hooks/useAuth';
import { Layout } from './shared/components/Layout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignUpPage } from './features/auth/pages/SignUpPage';
import { MarketPage } from './features/market/pages/MarketPage';
import { ProductDetailPage } from './features/market/pages/ProductDetailPage';
import { ProductUploadPage } from './features/market/pages/ProductUploadPage';
import { MyProductsPage } from './features/market/pages/MyProductsPage';
import { ChatPage } from './features/chat/pages/ChatPage';
import { WalletPage } from './features/wallet/pages/WalletPage';
import { ProfilePage } from './features/auth/pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/market" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/products/upload" element={<ProductUploadPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/my-products" element={<MyProductsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
