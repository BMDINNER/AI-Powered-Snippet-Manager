import React, { useEffect } from 'react';
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
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AIChatPage } from './components/ai/ai-chat-page';

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
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
  return (
    <BrowserRouter>
      <LogRegAuthProvider
        authUrl="http://localhost:3002"
        apiKey=""
        projectId=""
        loginEndpoint="/auth/login"
        registerEndpoint="/auth/register"
        logoutEndpoint="/auth/logout"
        refreshEndpoint="/auth/refresh"
        verifyEndpoint="/auth/verify"
        forgotPasswordEndpoint="/auth/forgot-password"
        resetPasswordEndpoint="/auth/reset-password"
      >
        <AppContent />
        <Toaster position="top-right" />
      </LogRegAuthProvider>
    </BrowserRouter>
  );
};

export default App;