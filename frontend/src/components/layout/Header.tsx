import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faUser, 
  faSignOutAlt,
  faChevronDown,
  faPlus,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <Container size="lg">
        <div className="flex items-center justify-between h-16">
          <div 
            onClick={() => navigate('/snippets')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <FontAwesomeIcon icon={faCode} className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              AI Snippets
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button
                    size="sm"
                    icon={faRobot}
                    onClick={() => navigate('/ai-chat')}
                    className="hidden md:inline-flex bg-black hover:bg-gray-800 text-white"
                  >
                    AI Chat
                  </Button>
                <Button
                    size="sm"
                    icon={faPlus}
                    onClick={() => navigate('/snippets/new')}
                    className="hidden md:inline-flex bg-black hover:bg-gray-800 text-white"
                  >
                    New
                </Button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-medium">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.username || 'User'}
                    </span>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-500" />
                        <span>Profile</span>
                      </button>
                      
                      <hr className="my-1 border-gray-200" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};