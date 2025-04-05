import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isVisible: boolean;
}

const Sidebar = ({ isVisible }: SidebarProps) => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Fetch learning paths
  const { data: learningPaths = [] } = useQuery({
    queryKey: ['/api/learning-paths'],
    enabled: !!user
  });
  
  return (
    <aside 
      className={`${isVisible ? 'block' : 'hidden'} md:block bg-white w-64 flex-shrink-0 border-r border-neutral-light overflow-y-auto ${
        isVisible && !location.startsWith('/modules/') ? 'absolute top-16 left-0 bottom-0 z-50' : ''
      }`}
    >
      <nav className="p-4">
        <div className="mb-8">
          <h2 className="text-xs font-medium text-neutral-medium uppercase tracking-wider mb-2">
            {t('menu')}
          </h2>
          <ul className="space-y-1">
            <li>
              <Link href="/">
                <a className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  location === '/' ? 'text-primary bg-primary-light bg-opacity-10' : 'text-neutral-dark hover:bg-neutral-light'
                }`}>
                  <span className="material-icons text-sm mr-3">dashboard</span>
                  {t('dashboard')}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/courses">
                <a className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  location === '/courses' ? 'text-primary bg-primary-light bg-opacity-10' : 'text-neutral-dark hover:bg-neutral-light'
                }`}>
                  <span className="material-icons text-sm mr-3">school</span>
                  {t('courses')}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/profile">
                <a className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  location === '/profile' ? 'text-primary bg-primary-light bg-opacity-10' : 'text-neutral-dark hover:bg-neutral-light'
                }`}>
                  <span className="material-icons text-sm mr-3">trending_up</span>
                  {t('myProgress')}
                </a>
              </Link>
            </li>
            <li>
              <Link href="/bookmarks">
                <a className={`flex items-center px-3 py-2 text-sm rounded-md ${
                  location === '/bookmarks' ? 'text-primary bg-primary-light bg-opacity-10' : 'text-neutral-dark hover:bg-neutral-light'
                }`}>
                  <span className="material-icons text-sm mr-3">bookmark</span>
                  {t('bookmarks')}
                </a>
              </Link>
            </li>
          </ul>
        </div>
        
        {user && learningPaths.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-neutral-medium uppercase tracking-wider mb-2">
              {t('learningPaths')}
            </h2>
            <ul className="space-y-1">
              {learningPaths.map((path: any) => (
                <li key={path.id}>
                  <Link href={`/learning-paths/${path.id}`}>
                    <a className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      location === `/learning-paths/${path.id}` ? 'text-primary bg-primary-light bg-opacity-10' : 'text-neutral-dark hover:bg-neutral-light'
                    }`}>
                      <span className="material-icons text-sm mr-3">{path.icon}</span>
                      {path.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
