import { useState } from 'react';
import { useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const CourseDetail = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [, params] = useRoute('/courses/:id');
  const courseId = parseInt(params?.id || '0');
  
  // Fetch course details
  const { data: course, isLoading } = useQuery({
    queryKey: ['/api/courses', courseId],
    enabled: !!courseId
  });
  
  // Check if enrolled
  const { data: enrollment } = useQuery({
    queryKey: ['/api/user/courses', courseId],
    enabled: !!user && !!courseId
  });
  
  const isEnrolled = !!enrollment;
  
  // Handle enrollment
  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: t('loginRequired'),
        description: t('pleaseLoginToEnroll'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await apiRequest('POST', `/api/user/enroll`, { courseId });
      
      toast({
        title: t('enrolled'),
        description: t('successfullyEnrolledInCourse'),
      });
      
      // Refetch enrollment status
      window.location.reload();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: t('error'),
        description: t('errorEnrollingInCourse'),
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isVisible={sidebarVisible} />
          <main className="flex-1 overflow-y-auto bg-neutral-lightest">
            <div className="container mx-auto px-4 py-8">
              <div className="animate-pulse">
                <div className="h-8 bg-neutral-light rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-neutral-light rounded w-1/2 mb-8"></div>
                <div className="h-64 bg-neutral-light rounded mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-light rounded"></div>
                  <div className="h-4 bg-neutral-light rounded"></div>
                  <div className="h-4 bg-neutral-light rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isVisible={sidebarVisible} />
          <main className="flex-1 overflow-y-auto bg-neutral-lightest">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center py-16">
                <h1 className="text-2xl font-medium mb-2">{t('courseNotFound')}</h1>
                <p className="text-neutral-medium">{t('courseNotFoundDescription')}</p>
                <a 
                  href="/courses" 
                  className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                >
                  {t('backToCourses')}
                </a>
              </div>
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="bg-primary text-white py-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-2/3">
                  <h1 className="text-3xl font-medium mb-2">{course.title}</h1>
                  <p className="mb-4">{course.description}</p>
                  <div className="flex items-center text-sm mb-6">
                    <span className="mr-4">
                      <span className="material-icons text-sm mr-1">person</span>
                      {course.instructor}
                    </span>
                    <span className="mr-4">
                      <span className="material-icons text-sm mr-1">school</span>
                      {course.providerName}
                    </span>
                    <span>
                      <span className="material-icons text-sm mr-1">schedule</span>
                      {t('totalModules')}: {course.modules?.length || 0}
                    </span>
                  </div>
                  
                  {!isEnrolled && (
                    <button 
                      className="bg-white text-primary px-6 py-2 rounded-md hover:bg-opacity-90 transition"
                      onClick={handleEnroll}
                    >
                      {t('enrollNow')}
                    </button>
                  )}
                </div>
                <div className="md:w-1/3 mt-4 md:mt-0">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-medium mb-4">{t('aboutThisCourse')}</h2>
              <p className="mb-4">{course.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-neutral-lightest p-4 rounded-md">
                  <span className="material-icons text-primary">schedule</span>
                  <h3 className="font-medium my-1">{t('duration')}</h3>
                  <p className="text-sm text-neutral-medium">
                    {course.durationHours ? `${course.durationHours} ${t('hours')}` : t('selfPaced')}
                  </p>
                </div>
                <div className="bg-neutral-lightest p-4 rounded-md">
                  <span className="material-icons text-primary">translate</span>
                  <h3 className="font-medium my-1">{t('availableLanguages')}</h3>
                  <p className="text-sm text-neutral-medium">
                    {course.languages?.join(', ') || t('multipleLanguages')}
                  </p>
                </div>
                <div className="bg-neutral-lightest p-4 rounded-md">
                  <span className="material-icons text-primary">devices</span>
                  <h3 className="font-medium my-1">{t('accessibleOn')}</h3>
                  <p className="text-sm text-neutral-medium">{t('allDevices')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-4">{t('modules')}</h2>
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module: any, index: number) => (
                    <div key={module.id} className="border border-neutral-light rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                              {index + 1}
                            </span>
                            <h3 className="font-medium">{module.title}</h3>
                          </div>
                          <p className="mt-1 text-sm text-neutral-medium">{module.description}</p>
                        </div>
                        {isEnrolled ? (
                          <a 
                            href={`/modules/${module.id}`}
                            className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-dark transition"
                          >
                            {t('start')}
                          </a>
                        ) : (
                          <span className="text-neutral-medium text-sm">{t('enrollToAccess')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-medium">{t('noModulesAvailable')}</p>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default CourseDetail;