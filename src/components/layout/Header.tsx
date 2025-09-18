import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Settings, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showAuth?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showAuth = true }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleHome = () => {
    if (user?.role === 'staff') {
      navigate('/staff/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">
            <span className="text-gray-900">Park</span>
            <span className="text-blue-600">meter</span>
          </h1>
          {title && (
            <span className="text-gray-500 text-lg">{title}</span>
          )}
        </div>

        {showAuth && user && (
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              icon={Settings}
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Home}
              onClick={handleHome}
            >
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleSignOut}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};