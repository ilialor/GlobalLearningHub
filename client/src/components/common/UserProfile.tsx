import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  user: {
    id: number;
    username: string;
    displayName: string;
    email: string;
  };
}

const UserProfile = ({ user }: UserProfileProps) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Get initials from display name
  const getInitials = () => {
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white">
          <span>{getInitials()}</span>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
          <div className="px-4 py-3 border-b border-neutral-light">
            <p className="text-sm font-medium text-neutral-dark">{user.displayName}</p>
            <p className="text-xs text-neutral-medium">{user.email}</p>
          </div>
          <ul className="py-1">
            <li>
              <Link href="/profile">
                <a className="px-4 py-2 hover:bg-neutral-light cursor-pointer flex items-center">
                  <span className="material-icons text-sm mr-2">person</span> {t('profile')}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <a className="px-4 py-2 hover:bg-neutral-light cursor-pointer flex items-center">
                  <span className="material-icons text-sm mr-2">settings</span> {t('settings')}
                </a>
              </Link>
            </li>
            <li>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-neutral-light cursor-pointer flex items-center text-error"
                onClick={handleLogout}
              >
                <span className="material-icons text-sm mr-2">logout</span> {t('logout')}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
