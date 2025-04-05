import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    instructor: string;
    thumbnailUrl: string;
    providerName?: string;
  };
  progress?: {
    percentage: number;
    completedModules: number;
    totalModules: number;
  };
  lastWatched?: string;
}

const CourseCard = ({ course, progress, lastWatched }: CourseCardProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 relative">
          <img 
            src={course.thumbnailUrl} 
            alt={course.title}
            className="w-full h-48 md:h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 md:hidden">
            <h3 className="font-medium">{course.title}</h3>
            <p className="text-sm text-neutral-light">{course.instructor}</p>
          </div>
        </div>
        
        <div className="md:w-2/3 p-6">
          <div className="hidden md:block">
            <h3 className="text-xl font-medium mb-1">{course.title}</h3>
            <p className="text-neutral-medium mb-4">{course.instructor}</p>
          </div>
          
          {progress && (
            <div className="mb-4">
              <div className="h-2 bg-neutral-light rounded-full">
                <div 
                  className="h-2 bg-primary rounded-full" 
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-neutral-medium">
                  {progress.percentage}% {t('complete')}
                </span>
                <span className="text-xs text-neutral-medium">
                  {progress.completedModules}/{progress.totalModules} {t('modules')}
                </span>
              </div>
            </div>
          )}
          
          <p className="text-neutral-dark mb-4">{course.description}</p>
          
          <div className="flex items-center justify-between">
            {lastWatched && (
              <div className="flex items-center text-neutral-medium">
                <span className="material-icons text-sm mr-1">schedule</span>
                <span className="text-sm">{t('lastWatched')}: {lastWatched}</span>
              </div>
            )}
            <Link href={progress ? `/modules/${progress.completedModules + 1}` : `/courses/${course.id}`}>
              <a className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition">
                {progress ? t('continue') : t('viewCourse')}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
