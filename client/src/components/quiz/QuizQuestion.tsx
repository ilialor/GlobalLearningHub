import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface QuizQuestionProps {
  question: {
    id: number;
    moduleId: number;
    questionText: string;
    options: string[];
    correctOptionIndex?: number;
    explanation?: string;
  };
  onContinue: () => void;
  onNeedHelp: () => void;
}

const QuizQuestion = ({ question, onContinue, onNeedHelp }: QuizQuestionProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    message: string;
  } | null>(null);
  
  const handleOptionSelect = (index: number) => {
    if (!isAnswered) {
      setSelectedOption(index);
    }
  };
  
  const handleSubmit = async () => {
    if (selectedOption === null) return;
    
    try {
      const response = await apiRequest('POST', '/api/quiz/answer', {
        questionId: question.id,
        selectedOption,
        moduleId: question.moduleId
      });
      
      const result = await response.json();
      
      setIsAnswered(true);
      setFeedback({
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        message: result.isCorrect ? t('correct') : t('incorrect')
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: t('error'),
        description: t('errorSubmittingAnswer'),
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium mb-3">{t('quickCheck')}: {question.questionText}</h3>
      
      <div className="mb-4">
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <label 
              key={index} 
              className={`flex items-start p-2 rounded cursor-pointer hover:bg-neutral-light ${
                isAnswered && feedback 
                  ? index === question.correctOptionIndex 
                    ? 'bg-success bg-opacity-10' 
                    : selectedOption === index && !feedback.isCorrect 
                      ? 'bg-error bg-opacity-10' 
                      : ''
                  : ''
              }`}
            >
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                className="mt-0.5 mr-2"
                checked={selectedOption === index}
                onChange={() => handleOptionSelect(index)}
                disabled={isAnswered}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {isAnswered && feedback && (
        <div className={`p-3 ${
          feedback.isCorrect 
            ? 'bg-success bg-opacity-10 text-success' 
            : 'bg-error bg-opacity-10 text-error'
        } rounded-md mb-4`}>
          <div className="flex">
            <span className="material-icons mr-2">
              {feedback.isCorrect ? 'check_circle' : 'error'}
            </span>
            <div>
              <p className="font-medium">{feedback.message}!</p>
              <p className="text-sm">{feedback.explanation}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between">
        <button 
          className="text-primary hover:underline"
          onClick={onNeedHelp}
        >
          {t('needHelp')}
        </button>
        
        {!isAnswered ? (
          <button 
            className={`bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark ${
              selectedOption === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            {t('submitAnswer')}
          </button>
        ) : (
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            onClick={onContinue}
          >
            {t('continue')}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizQuestion;
