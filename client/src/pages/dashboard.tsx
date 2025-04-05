import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import CourseCard from '@/components/course/CourseCard';
import RecommendedCourseCard from '@/components/course/RecommendedCourseCard';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  // Fetch user's current courses
  const { data: currentCourses = [] } = useQuery<any[]>({
    queryKey: ['/api/user/courses'],
    enabled: !!user
  });
  
  // Fetch recommended courses
  const { data: recommendedCourses = [] } = useQuery<any[]>({
    queryKey: ['/api/courses/recommended'],
    enabled: !!user
  });
  
  // Fetch user's weekly progress
  const { data: weeklyProgress } = useQuery<{
    currentHours: number;
    goalHours: number;
    percentage: number;
  }>({
    queryKey: ['/api/user/weekly-progress'],
    enabled: !!user
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto px-4 py-8">
            {user ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-medium mb-2">
                    {t('welcomeBack')}, {user.displayName}!
                  </h1>
                  <p className="text-neutral-medium">
                    {t('continueYourLearningJourney')}
                  </p>
                </div>
                
                {weeklyProgress && (
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-xl font-medium mb-4">{t('weeklyProgress')}</h2>
                    <div className="flex items-center">
                      <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center mr-4">
                        <span className="text-xl font-medium">{weeklyProgress.currentHours} h</span>
                      </div>
                      <div>
                        <p className="text-neutral-dark">
                          {t('youveSpentXHoursLearningThisWeek', { hours: weeklyProgress.currentHours })}
                        </p>
                        <p className="text-neutral-medium text-sm mt-1">
                          {weeklyProgress.currentHours > 5
                            ? t('greatProgress')
                            : t('keepItUp')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentCourses.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-medium mb-4">{t('continueLearn')}</h2>
                    <div className="space-y-4">
                      {currentCourses.map((course: any) => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          progress={course.progress}
                          lastWatched={course.lastWatched}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-xl font-medium mb-4">{t('recommendedForYou')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedCourses.map((course: any) => (
                      <RecommendedCourseCard 
                        key={course.id} 
                        course={course} 
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96">
                <h1 className="text-2xl font-medium mb-2">
                  {t('welcomeToGlobalAcademy')}
                </h1>
                <p className="text-neutral-medium mb-4">
                  {t('pleaseLoginToAccessDashboard')}
                </p>
                <a 
                  href="/login" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                >
                  {t('login')}
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

export default Dashboard;