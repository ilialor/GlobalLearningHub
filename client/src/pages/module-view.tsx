import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from '@/components/course/VideoPlayer';
import TranscriptViewer from '@/components/course/TranscriptViewer';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const ModuleView = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [, params] = useRoute('/modules/:id');
  const moduleId = parseInt(params?.id || '0');
  
  const [currentTime, setCurrentTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<{ summary: string, keyPoints: string[] } | null>(null);
  
  // Fetch module details
  const { data: module, isLoading } = useQuery({
    queryKey: ['/api/modules', moduleId],
    enabled: !!moduleId
  });
  
  // Fetch course details for the module
  const { data: course } = useQuery({
    queryKey: ['/api/courses', module?.courseId],
    enabled: !!module?.courseId
  });
  
  // Fetch quiz questions for the module
  const { data: quizQuestions = [] } = useQuery({
    queryKey: ['/api/quiz/questions', moduleId],
    enabled: !!moduleId
  });
  
  // Fetch user progress for the module
  const { data: userProgress } = useQuery({
    queryKey: ['/api/progress', moduleId],
  });
  
  // Check for quiz at current timestamp
  useEffect(() => {
    if (quizQuestions.length > 0 && !showQuiz) {
      const questionAtCurrentTime = quizQuestions.find(
        (q: any) => q.appearanceTime && Math.abs(q.appearanceTime - currentTime) < 1
      );
      
      if (questionAtCurrentTime) {
        const index = quizQuestions.indexOf(questionAtCurrentTime);
        setQuizIndex(index);
        setShowQuiz(true);
      }
    }
  }, [currentTime, quizQuestions, showQuiz]);
  
  // Handle video progress update
  const handleProgressUpdate = (position: number) => {
    setCurrentTime(position);
  };
  
  // Handle module completion
  const handleModuleComplete = async () => {
    try {
      await apiRequest('POST', '/api/progress/complete', { moduleId });
      
      toast({
        title: t('moduleCompleted'),
        description: t('youveCompletedThisModule'),
      });
    } catch (error) {
      console.error('Error marking module as complete:', error);
    }
  };
  
  // Handle jump to timestamp in video
  const handleJumpToTime = (time: number) => {
    setCurrentTime(time);
  };
  
  // Handle generating summary
  const handleGenerateSummary = async () => {
    if (summarizing || !moduleId) return;
    
    setSummarizing(true);
    
    try {
      const response = await apiRequest('GET', `/api/modules/${moduleId}/summary`);
      const summaryData = await response.json();
      
      setSummary(summaryData);
      setShowSummary(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: t('error'),
        description: t('errorGeneratingSummary'),
        variant: 'destructive'
      });
    } finally {
      setSummarizing(false);
    }
  };
  
  // Handle need help with quiz
  const handleNeedHelp = () => {
    setShowQuiz(false);
  };
  
  if (isLoading || !module) {
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isVisible={sidebarVisible} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-lightest">
          <div className="container mx-auto px-4 py-4">
            <div className="mb-4">
              <h1 className="text-2xl font-medium">{module.title}</h1>
              <p className="text-neutral-medium">
                {course?.title} • {t('module')} {module.position}
              </p>
            </div>
            
            <div className="mb-6">
              <VideoPlayer
                videoUrl={module.videoUrl}
                courseId={module.courseId}
                moduleId={module.id}
                lastPosition={userProgress?.lastPosition || 0}
                thumbnailUrl={course?.thumbnailUrl}
                onProgress={handleProgressUpdate}
                onComplete={handleModuleComplete}
              />
            </div>
            
            {showQuiz && quizQuestions[quizIndex] && (
              <div className="mb-6">
                <QuizQuestion
                  question={quizQuestions[quizIndex]}
                  onContinue={() => setShowQuiz(false)}
                  onNeedHelp={handleNeedHelp}
                />
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="flex justify-between items-center border-b border-neutral-light p-4">
                <h2 className="text-lg font-medium">{t('moduleContent')}</h2>
                <div className="space-x-2">
                  <button
                    className={`px-3 py-1 rounded-md text-sm ${
                      showSummary
                        ? 'bg-primary text-white'
                        : 'bg-neutral-light text-neutral-dark'
                    }`}
                    onClick={() => setShowSummary(!showSummary)}
                    disabled={!summary}
                  >
                    {t('summary')}
                  </button>
                  <button
                    className="bg-neutral-light text-neutral-dark px-3 py-1 rounded-md text-sm"
                    onClick={handleGenerateSummary}
                    disabled={summarizing}
                  >
                    {summarizing ? t('generating') : t('generateSummary')}
                  </button>
                </div>
              </div>
              
              {showSummary && summary ? (
                <div className="p-4">
                  <h3 className="font-medium mb-2">{t('summary')}</h3>
                  <p className="mb-4">{summary.summary}</p>
                  
                  <h3 className="font-medium mb-2">{t('keyPoints')}</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {summary.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-neutral-medium mb-4">{module.description}</p>
                  
                  {module.transcript && module.transcript.segments && (
                    <TranscriptViewer
                      segments={module.transcript.segments}
                      currentTime={currentTime}
                      onJumpToTime={handleJumpToTime}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default ModuleView;