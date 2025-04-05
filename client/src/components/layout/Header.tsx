import { useState } from 'react';
import { Link } from 'wouter';
import LanguageSelector from '../common/LanguageSelector';
import UserProfile from '../common/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  return (
    <header className="bg-primary text-white shadow-md z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button 
            className="md:hidden" 
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar menu"
          >
            <span className="material-icons">menu</span>
          </button>
          <Link href="/">
            <a className="flex items-center">
              <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-xl font-medium">GlobalAcademy</h1>
            </a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          {user ? (
            <UserProfile user={user} />
          ) : (
            <Link href="/login">
              <a className="py-1 px-3 rounded bg-primary-dark hover:bg-opacity-90">
                {t('login')}
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
