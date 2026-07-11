import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@bmdinner/logreg';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faArrowRight,
  faCode
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/snippets');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      navigate('/snippets');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `${AUTH_URL}/auth/oauth/${provider}`;
  };

  const handleForgotPassword = () => {
    window.location.href = `${AUTH_URL}/forgot-password`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Container size="sm" className="relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-800 to-gray-600 rounded-2xl shadow-lg mb-4">
            <FontAwesomeIcon icon={faCode} className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to AI Snippets</p>
        </div>

        <Card className="bg-white shadow-xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={faEnvelope}
                required
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={faLock}
                required
                placeholder="*********"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              icon={faArrowRight}
              iconPosition="right"
              className="bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-900 hover:to-gray-700 text-white py-3"
            >
              Sign in
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={faGoogle} className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-gray-700">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={faGithub} className="h-5 w-5 text-gray-900 mr-2" />
                <span className="text-sm text-gray-700">GitHub</span>
              </button>
            </div>

            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-gray-800 hover:text-gray-900 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </Card>
      </Container>
    </div>
  );
};