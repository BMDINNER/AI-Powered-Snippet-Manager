import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@bmdinner/logreg';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Registration successful! Please login.');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        setError('This email is already registered. Please login instead.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
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
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
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
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                icon={faUser}
                required
                placeholder="johndoe"
              />

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
                placeholder="••••••••"
                minLength={6}
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
              Sign Up
            </Button>

            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-gray-800 hover:text-gray-900 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </Container>
    </div>
  );
};