import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@bmdinner/logreg';
import { useSnippets } from '../../hooks/useSnippets';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faCalendarAlt,
  faSignOutAlt,
  faArrowLeft,
  faCode,
  faChartLine,
  faRocket,
  faSave,
  faTimes,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { snippets, fetchSnippets } = useSnippets();
  const navigate = useNavigate();
  
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    languages: 0,
    aiGenerated: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSnippets({ limit: 100 });
    setNewEmail(user.email || '');
  }, [user, navigate]);

  useEffect(() => {
    if (snippets.length > 0) {
      const languages = new Set(snippets.map(s => s.language));
      const aiGen = snippets.filter(s => s.aiGenerated).length;

      setStats({
        total: snippets.length,
        languages: languages.size,
        aiGenerated: aiGen
      });
    }
  }, [snippets]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail, password })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Email updated successfully. Please log in again with your new email.');
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        await logout();
        navigate('/login');
      } else {
        toast.error(data.message || 'Failed to update email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Password changed successfully. Please log in again with your new password.');
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        await logout();
        navigate('/login');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-black text-white shadow-xl">
        <Container className="py-12">
          <button
            onClick={() => navigate('/snippets')}
            className="flex items-center text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            <span className="font-medium">Back to Snippets</span>
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-gray-700">
                <FontAwesomeIcon icon={faUser} className="h-12 w-12 text-gray-300" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{user.username || 'User'}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-gray-300">
                  <span className="flex items-center text-sm">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 h-4 w-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center text-sm">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 h-4 w-4" />
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              variant="danger"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-l-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Snippets</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faCode} className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-l-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Languages Used</p>
                <p className="text-3xl font-bold text-gray-900">{stats.languages}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-l-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">AI Generated</p>
                <p className="text-3xl font-bold text-gray-900">{stats.aiGenerated}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faRocket} className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 sm:w-32">Username</span>
              <span className="text-gray-900">{user.username || 'Not set'}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 sm:w-32">Email</span>
              {isEditingEmail ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    className="flex-1"
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Current password"
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateEmail}
                      loading={loading}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEditingEmail(false);
                        setNewEmail(user.email || '');
                        setPassword('');
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-gray-900">{user.email}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setNewEmail(user.email || '');
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 sm:w-32">Password</span>
              {isChangingPassword ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="flex-1"
                  />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="flex-1"
                  />
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleChangePassword}
                      loading={loading}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmNewPassword('');
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-gray-500">••••••••</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Change Password
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 sm:w-32">Account Type</span>
              <span className="text-gray-900">{user.provider === 'local' ? 'Email & Password' : user.provider}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-3">
              <span className="text-sm font-medium text-gray-500 sm:w-32">Joined</span>
              <span className="text-gray-900">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};