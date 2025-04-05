import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

interface LearningPath {
  id: number;
  title: string;
  description: string;
  progress: number;
  coursesCount: number;
  estimatedHours: number;
  level: string;
}

const LearningPaths = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Fetch all learning paths
  const { data: learningPaths = [] } = useQuery({
    queryKey: ['/api/learning-paths'],
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-medium mb-2">{t('learningPaths')}</h1>
              <p className="text-neutral-medium">
                {t('learningPathsDescription')}
              </p>
            </div>
            
            {learningPaths.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {learningPaths.map((path: LearningPath) => (
                  <div key={path.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-medium mb-2">{path.title}</h2>
                      <p className="text-neutral-medium mb-4 line-clamp-2">{path.description}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="bg-neutral-lightest py-1 px-3 rounded-full text-sm">
                          <span className="font-medium">{path.coursesCount}</span> {t('courses')}
                        </div>
                        <div className="bg-neutral-lightest py-1 px-3 rounded-full text-sm">
                          <span className="font-medium">{path.estimatedHours || 0}</span> {t('hours')}
                        </div>
                        <div className="bg-neutral-lightest py-1 px-3 rounded-full text-sm">
                          {path.level || t('beginner')}
                        </div>
                      </div>
                      
                      {user && path.progress > 0 ? (
                        <div className="mb-4">
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
                      ) : null}
                      
                      <Link href={`/learning-paths/${path.id}`}>
                        <a className="block text-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition">
                          {user && path.progress > 0 ? t('continue') : t('startLearning')}
                        </a>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-neutral-medium mb-4">{t('noLearningPathsAvailable')}</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default LearningPaths;