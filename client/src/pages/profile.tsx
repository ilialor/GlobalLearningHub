import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import CourseCard from '@/components/course/CourseCard';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('progress');
  
  // Fetch user's courses
  const { data: userCourses = [] } = useQuery({
    queryKey: ['/api/user/courses'],
    enabled: !!user
  });
  
  // Fetch user's learning paths
  const { data: userLearningPaths = [] } = useQuery({
    queryKey: ['/api/user/learning-paths'],
    enabled: !!user
  });
  
  // Fetch user's quiz results
  const { data: quizResults = [] } = useQuery({
    queryKey: ['/api/user/quiz-results'],
    enabled: !!user
  });
  
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isVisible={sidebarVisible} />
          <main className="flex-1 overflow-y-auto bg-neutral-lightest">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center py-16">
                <h1 className="text-2xl font-medium mb-2">{t('loginRequired')}</h1>
                <p className="text-neutral-medium mb-4">{t('pleaseLoginToViewProfile')}</p>
                <a 
                  href="/login" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                >
                  {t('login')}
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
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="md:flex items-center">
                <div className="md:w-1/4 flex justify-center mb-4 md:mb-0">
                  <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center text-white text-3xl">
                    {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                </div>
                <div className="md:w-3/4">
                  <h1 className="text-2xl font-medium mb-1">{user.displayName}</h1>
                  <p className="text-neutral-medium mb-3">{user.email}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-neutral-lightest p-3 rounded-md flex items-center">
                      <span className="material-icons text-primary mr-2">school</span>
                      <div>
                        <div className="text-sm text-neutral-medium">{t('coursesEnrolled')}</div>
                        <div className="font-medium">{userCourses.length}</div>
                      </div>
                    </div>
                    <div className="bg-neutral-lightest p-3 rounded-md flex items-center">
                      <span className="material-icons text-primary mr-2">route</span>
                      <div>
                        <div className="text-sm text-neutral-medium">{t('learningPaths')}</div>
                        <div className="font-medium">{userLearningPaths.length}</div>
                      </div>
                    </div>
                    <div className="bg-neutral-lightest p-3 rounded-md flex items-center">
                      <span className="material-icons text-primary mr-2">quiz</span>
                      <div>
                        <div className="text-sm text-neutral-medium">{t('quizzesTaken')}</div>
                        <div className="font-medium">{quizResults.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-neutral-light">
                <div className="flex">
                  <button 
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'progress' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-neutral-medium hover:text-neutral-dark'
                    }`}
                    onClick={() => setActiveTab('progress')}
                  >
                    {t('myProgress')}
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'paths' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-neutral-medium hover:text-neutral-dark'
                    }`}
                    onClick={() => setActiveTab('paths')}
                  >
                    {t('learningPaths')}
                  </button>
                  <button 
                    className={`px-6 py-3 font-medium ${
                      activeTab === 'quizzes' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-neutral-medium hover:text-neutral-dark'
                    }`}
                    onClick={() => setActiveTab('quizzes')}
                  >
                    {t('quizResults')}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'progress' && (
                  <div>
                    <h2 className="text-xl font-medium mb-4">{t('myCourses')}</h2>
                    {userCourses.length > 0 ? (
                      <div className="space-y-4">
                        {userCourses.map((course: any) => (
                          <CourseCard 
                            key={course.id} 
                            course={course} 
                            progress={course.progress}
                            lastWatched={course.lastWatched}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-neutral-medium mb-4">{t('noCoursesEnrolledYet')}</p>
                        <a 
                          href="/courses" 
                          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
                        >
                          {t('exploreCourses')}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'paths' && (
                  <div>
                    <h2 className="text-xl font-medium mb-4">{t('myLearningPaths')}</h2>
                    {userLearningPaths.length > 0 ? (
                      <div className="grid gap-4">
                        {userLearningPaths.map((path: any) => (
                          <div key={path.id} className="bg-neutral-lightest rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium mb-1">{path.title}</h3>
                                <p className="text-sm text-neutral-medium mb-2">{path.description}</p>
                                <div className="flex items-center">
                                  <div className="w-full max-w-xs bg-neutral-light rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full" 
                                      style={{ width: `${path.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-neutral-medium">{path.progress}%</span>
                                </div>
                              </div>
                              <a 
                                href={`/learning-paths/${path.id}`}
                                className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-dark transition"
                              >
                                {t('continue')}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-neutral-medium">{t('noLearningPathsJoinedYet')}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'quizzes' && (
                  <div>
                    <h2 className="text-xl font-medium mb-4">{t('quizResults')}</h2>
                    {quizResults.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-light">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-medium tracking-wider">
                                {t('course')}
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-medium tracking-wider">
                                {t('module')}
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-medium tracking-wider">
                                {t('score')}
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-medium tracking-wider">
                                {t('date')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-light">
                            {quizResults.map((result: any) => (
                              <tr key={result.id}>
                                <td className="px-4 py-3 text-sm text-neutral-dark">
                                  {result.courseTitle}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-dark">
                                  {result.moduleTitle}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    result.score >= 80 
                                      ? 'bg-success bg-opacity-10 text-success' 
                                      : result.score >= 60 
                                        ? 'bg-warning bg-opacity-10 text-warning' 
                                        : 'bg-error bg-opacity-10 text-error'
                                  }`}>
                                    {result.score}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-medium">
                                  {new Date(result.completedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-neutral-medium">{t('noQuizzesCompletedYet')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Profile;