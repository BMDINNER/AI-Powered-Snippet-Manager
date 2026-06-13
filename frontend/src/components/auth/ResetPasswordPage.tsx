import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@bmdinner/logreg';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faArrowRight, faCode } from '@fortawesome/free-solid-svg-icons';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      navigate('/login');
    } else {
      setToken(resetToken);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(token!, formData.password);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Password</h1>
          <p className="text-gray-600 mt-2">
            Please enter your new password below.
          </p>
        </div>

        <Card className="bg-white shadow-xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              icon={faLock}
              required
              placeholder="••••••••"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              icon={faLock}
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              icon={faArrowRight}
              iconPosition="right"
              className="bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-900 hover:to-gray-700 text-white py-3"
            >
              Reset Password
            </Button>

            <p className="text-center text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-gray-800 hover:text-gray-900 font-semibold hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </form>
        </Card>
      </Container>
    </div>
  );
};