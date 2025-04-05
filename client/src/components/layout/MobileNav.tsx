import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

const MobileNav = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden bg-white border-t border-neutral-light">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center pt-2 pb-1 ${
            location === '/' ? 'text-primary' : 'text-neutral-medium'
          }`}>
            <span className="material-icons">dashboard</span>
            <span className="text-xs mt-1">{t('dashboard')}</span>
          </a>
        </Link>
        <Link href="/courses">
          <a className={`flex flex-col items-center pt-2 pb-1 ${
            location === '/courses' ? 'text-primary' : 'text-neutral-medium'
          }`}>
            <span className="material-icons">school</span>
            <span className="text-xs mt-1">{t('courses')}</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center pt-2 pb-1 ${
            location.startsWith('/profile') ? 'text-primary' : 'text-neutral-medium'
          }`}>
            <span className="material-icons">trending_up</span>
            <span className="text-xs mt-1">{t('progress')}</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center pt-2 pb-1 ${
            location === '/profile' ? 'text-primary' : 'text-neutral-medium'
          }`}>
            <span className="material-icons">person</span>
            <span className="text-xs mt-1">{t('profile')}</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;
