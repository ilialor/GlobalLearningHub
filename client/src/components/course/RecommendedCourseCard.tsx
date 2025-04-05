import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

interface RecommendedCourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    instructor: string;
    thumbnailUrl: string;
    rating: number;
    ratingCount: number;
    isNew: boolean;
  };
}

const RecommendedCourseCard = ({ course }: RecommendedCourseCardProps) => {
  const { t } = useTranslation();
  
  // Generate star ratings
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(course.rating);
    const hasHalfStar = course.rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`star-${i}`} className="material-icons text-sm text-warning">star</span>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="material-icons text-sm text-warning">star_half</span>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="material-icons text-sm text-neutral-medium">star_border</span>
      );
    }
    
    return stars;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img 
          src={course.thumbnailUrl} 
          alt={course.title} 
          className="w-full h-48 object-cover"
        />
        {course.isNew && (
          <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded">
            {t('new')}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium mb-1">{course.title}</h3>
        <p className="text-sm text-neutral-medium mb-3">{course.instructor}</p>
        <p className="text-sm text-neutral-dark mb-4 flex-1">{course.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            {renderStars()}
            <span className="text-xs text-neutral-medium ml-1">({course.ratingCount})</span>
          </div>
          <Link href={`/courses/${course.id}`}>
            <a className="text-primary text-sm hover:underline">{t('enroll')}</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecommendedCourseCard;
