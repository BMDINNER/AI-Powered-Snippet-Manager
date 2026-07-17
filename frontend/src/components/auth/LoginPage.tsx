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

const AUTH_URL = import.meta.env.VITE_AUTH_URL;

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
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.data?.message) {
        const msg = err.response.data.message;
        if (msg.includes('refresh') || msg.includes('token')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(msg);
        }
      } else if (err.message) {
        if (err.message.includes('refresh') || err.message.includes('token')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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