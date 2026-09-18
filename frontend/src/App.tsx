import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider as LogRegAuthProvider, useAuth } from '@bmdinner/logreg';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ProfilePage } from './components/auth/ProfilePage';
import { SnippetList } from './components/snippets/SnippetList';
import { SnippetForm } from './components/snippets/SnippetForm';
import { SnippetDetail } from './components/snippets/SnippetDetail';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AIChatPage } from './components/ai/ai-chat-page';
import 'highlight.js/styles/atom-one-dark.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" className="py-12" />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" className="py-12" />;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/snippets" />;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/ai-chat" element={<PrivateRoute><Layout><AIChatPage /></Layout></PrivateRoute>} />
      <Route path="/snippets" element={<PrivateRoute><Layout><SnippetList /></Layout></PrivateRoute>} />
      <Route path="/snippets/new" element={<PrivateRoute><Layout><SnippetForm onClose={() => window.history.back()} /></Layout></PrivateRoute>} />
      <Route path="/snippets/:id" element={<PrivateRoute><Layout><SnippetDetail /></Layout></PrivateRoute>} />
      <Route path="/snippets/:id/edit" element={<PrivateRoute><Layout><SnippetForm onClose={() => window.history.back()} /></Layout></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/snippets" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <BrowserRouter>
      <LogRegAuthProvider
        authUrl={apiUrl}
        loginEndpoint="/api/auth/login"
        registerEndpoint="/api/auth/register"
        logoutEndpoint="/api/auth/logout"
        refreshEndpoint="/api/auth/refresh"
        verifyEndpoint="/api/auth/verify"
      >
        <AppContent />
        <Toaster position="top-right" />
      </LogRegAuthProvider>
    </BrowserRouter>
  );
};

export default App;