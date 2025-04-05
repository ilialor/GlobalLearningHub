import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import CourseCard from '@/components/course/CourseCard';

const LearningPathDetail = ({ params }: { params: { id: string } }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const pathId = parseInt(params.id, 10);
  
  // Fetch learning path details
  const { data: path = {}, isLoading: isPathLoading } = useQuery({
    queryKey: [`/api/learning-paths/${pathId}`],
    enabled: !isNaN(pathId)
  });
  
  // Fetch courses in this learning path
  const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: [`/api/learning-paths/${pathId}/courses`],
    enabled: !isNaN(pathId)
  });
  
  const isLoading = isPathLoading || isCoursesLoading;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto px-4 py-8">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-neutral-light rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-neutral-light rounded w-2/3 mb-8"></div>
                <div className="h-24 bg-neutral-light rounded mb-4"></div>
                <div className="h-24 bg-neutral-light rounded mb-4"></div>
                <div className="h-24 bg-neutral-light rounded mb-4"></div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <Link href="/learning-paths">
                    <a className="text-primary hover:underline mb-2 inline-block">
                      <span className="inline-block mr-1">←</span> {t('backToLearningPaths')}
                    </a>
                  </Link>
                  <h1 className="text-2xl font-medium mb-2">{path.title}</h1>
                  <p className="text-neutral-medium">
                    {path.description}
                  </p>
                  
                  {user && path.progress > 0 && (
                    <div className="mt-4 max-w-xl">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('yourProgress')}</span>
                        <span className="font-medium">{path.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-light rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h2 className="text-xl font-medium mb-4">{t('aboutThisPath')}</h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <h3 className="font-medium text-neutral-medium mb-1">{t('level')}</h3>
                      <p>{path.level || t('beginner')}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-medium mb-1">{t('courses')}</h3>
                      <p>{path.coursesCount || courses.length}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-medium mb-1">{t('estimatedTime')}</h3>
                      <p>{path.estimatedHours || 0} {t('hours')}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-medium mb-4">{t('coursesInThisPath')}</h2>
                  
                  {courses.length > 0 ? (
                    <div className="space-y-4">
                      {courses.map((course: any, index: number) => (
                        <div key={course.id} className="flex">
                          <div className="flex-shrink-0 flex flex-col items-center mr-4">
                            <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-medium">
                              {index + 1}
                            </div>
                            {index < courses.length - 1 && (
                              <div className="w-0.5 h-full bg-neutral-light mt-2"></div>
                            )}
                          </div>
                          <div className="flex-grow pb-4">
                            <CourseCard 
                              course={course} 
                              progress={course.progress}
                              lastWatched={course.lastWatched}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-neutral-lightest rounded-lg p-6 text-center">
                      <p className="text-neutral-medium">{t('noCoursesInThisPath')}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default LearningPathDetail;