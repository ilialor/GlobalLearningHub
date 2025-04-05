import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLanguage = LANGUAGES[i18n.language as keyof typeof LANGUAGES] || LANGUAGES.en;
  
  useEffect(() => {
    // Set language from user preference or browser
    if (user && user.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
    }
  }, [user]);
  
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
  
  const changeLanguage = async (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // If user is logged in, save preference
    if (user) {
      try {
        await apiRequest('PUT', '/api/user/language', { language: languageCode });
      } catch (error) {
        console.error('Error saving language preference:', error);
        toast({
          title: 'Error',
          description: 'Could not save language preference',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center py-1 px-2 bg-primary-dark rounded focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <img 
          src={currentLanguage.flag} 
          alt={currentLanguage.name} 
          className="w-5 h-5 rounded-sm mr-2" 
        />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <span className="material-icons text-sm ml-1">arrow_drop_down</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
          <ul className="py-1">
            {Object.values(LANGUAGES).map((language) => (
              <li 
                key={language.code}
                className="flex items-center px-4 py-2 hover:bg-neutral-light cursor-pointer"
                onClick={() => changeLanguage(language.code)}
              >
                <img 
                  src={language.flag} 
                  alt={language.name} 
                  className="w-5 h-5 rounded-sm mr-3" 
                />
                <span>{language.nativeName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
