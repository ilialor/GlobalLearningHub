import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import CourseCard from '@/components/course/CourseCard';

const Bookmarks = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Bookmarks would typically be fetched from an API
  // For now, we'll use an empty array as a placeholder
  const { data: bookmarkedCourses = [] } = useQuery({
    queryKey: ['/api/user/bookmarks'],
    enabled: !!user
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-medium mb-2">{t('bookmarks')}</h1>
              <p className="text-neutral-medium">
                {t('yourSavedContentDescription')}
              </p>
            </div>
            
            {!user ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h2 className="text-xl font-medium mb-2">{t('loginRequired')}</h2>
                <p className="text-neutral-medium mb-4">{t('pleaseLoginToViewBookmarks')}</p>
                <a 
                  href="/login" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                >
                  {t('login')}
                </a>
              </div>
            ) : bookmarkedCourses.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedCourses.map((course: any) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h2 className="text-lg font-medium mb-2">{t('noBookmarksYet')}</h2>
                <p className="text-neutral-medium mb-4">{t('bookmarkCoursesDescription')}</p>
                <a 
                  href="/courses" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                >
                  {t('exploreCourses')}
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Bookmarks;