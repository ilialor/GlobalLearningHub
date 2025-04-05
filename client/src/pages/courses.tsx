import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import CourseCard from '@/components/course/CourseCard';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

const Courses = () => {
  const { t } = useTranslation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Fetch all courses
  const { data: allCourses = [] } = useQuery({
    queryKey: ['/api/courses'],
  });
  
  // Filter and search courses
  const filteredCourses = allCourses.filter((course: any) => {
    const matchesQuery = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesQuery;
    return matchesQuery && course.category === filter;
  });
  
  // Get unique categories
  const categories = [...new Set(allCourses.map((course: any) => course.category))];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-medium mb-2">{t('exploreCourses')}</h1>
              <p className="text-neutral-medium">{t('discoverNewSkills')}</p>
            </div>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="md:flex-1">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 pl-10 border border-neutral-light rounded-md"
                    placeholder={t('searchCourses')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="material-icons absolute left-3 top-2 text-neutral-medium">search</span>
                </div>
              </div>
              
              <div className="md:w-64">
                <select
                  className="w-full px-4 py-2 border border-neutral-light rounded-md"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">{t('allCategories')}</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {filteredCourses.length > 0 ? (
              <div className="space-y-4">
                {filteredCourses.map((course: any) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-medium">{t('noCoursesFound')}</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Courses;