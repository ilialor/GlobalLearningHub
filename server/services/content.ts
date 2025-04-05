import { storage } from "../storage";
import { translationService, LanguageCode } from "./translation";
import { llmService } from "./llm";
import { type Course, type Module, type Transcript, type QuizQuestion } from "@shared/schema";

// Represents a content segment with a start and end time and text
export interface ContentSegment {
  startTime: number;
  endTime: number;
  text: string;
}

// Standardized format for course content
export interface StandardizedCourseContent {
  providerId: number;
  providerName: string;
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  instructor: string;
  thumbnailUrl: string;
  modules: {
    id: number;
    title: string;
    description: string;
    position: number;
    videoUrl: string;
    durationSeconds: number;
    transcript?: {
      id: number;
      segments: ContentSegment[];
    };
  }[];
}

// Interface for a localized (translated) course
export interface LocalizedCourse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  providerId: number;
  providerName: string;
  rating: number;
  ratingCount: number;
  isNew: boolean;
}

// Interface for a localized module with transcript
export interface LocalizedModule {
  id: number;
  courseId: number;
  title: string;
  description: string;
  position: number;
  videoUrl: string;
  durationSeconds: number;
  transcript: {
    id: number;
    segments: ContentSegment[];
  };
}

// Interface for a localized quiz question
export interface LocalizedQuizQuestion {
  id: number;
  moduleId: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  appearanceTime?: number;
  difficulty: number;
}

class ContentService {
  /**
   * Get a list of all courses with basic info, localized to the specified language
   */
  async getLocalizedCourses(languageCode: LanguageCode): Promise<LocalizedCourse[]> {
    const courses = await storage.getCourses();
    const providers = await storage.getContentProviders();
    
    const localizedCourses: LocalizedCourse[] = [];
    
    for (const course of courses) {
      const provider = providers.find(p => p.id === course.providerId);
      if (!provider) continue;
      
      // Translate course information
      const [localizedTitle, localizedDescription] = await Promise.all([
        translationService.translateText({
          text: course.title,
          targetLanguage: languageCode
        }),
        translationService.translateText({
          text: course.description,
          targetLanguage: languageCode
        })
      ]);
      
      localizedCourses.push({
        ...course,
        title: localizedTitle,
        description: localizedDescription,
        providerName: provider.name
      });
    }
    
    return localizedCourses;
  }
  
  /**
   * Get detailed information about a specific course, including modules
   */
  async getLocalizedCourseDetail(courseId: number, languageCode: LanguageCode): Promise<LocalizedCourse & { modules: Omit<LocalizedModule, "transcript">[] }> {
    const course = await storage.getCourse(courseId);
    if (!course) throw new Error(`Course with ID ${courseId} not found`);
    
    const provider = await storage.getContentProvider(course.providerId);
    if (!provider) throw new Error(`Provider with ID ${course.providerId} not found`);
    
    // Get all modules for this course
    const modules = await storage.getModulesByCourse(courseId);
    
    // Translate course information
    const [localizedTitle, localizedDescription] = await Promise.all([
      translationService.translateText({
        text: course.title,
        targetLanguage: languageCode
      }),
      translationService.translateText({
        text: course.description,
        targetLanguage: languageCode
      })
    ]);
    
    // Translate module information
    const localizedModules = await Promise.all(modules.map(async module => {
      const [localizedTitle, localizedDescription] = await Promise.all([
        translationService.translateText({
          text: module.title,
          targetLanguage: languageCode
        }),
        translationService.translateText({
          text: module.description || "",
          targetLanguage: languageCode
        })
      ]);
      
      return {
        ...module,
        title: localizedTitle,
        description: localizedDescription
      };
    }));
    
    return {
      ...course,
      title: localizedTitle,
      description: localizedDescription,
      providerName: provider.name,
      modules: localizedModules
    };
  }
  
  /**
   * Get a specific module with its transcript in the requested language
   */
  async getLocalizedModule(moduleId: number, languageCode: LanguageCode): Promise<LocalizedModule> {
    const module = await storage.getModule(moduleId);
    if (!module) throw new Error(`Module with ID ${moduleId} not found`);
    
    // Try to get transcript in requested language
    let transcript = await storage.getTranscriptByModule(moduleId, languageCode);
    
    // If no transcript in requested language, get English and translate
    if (!transcript) {
      const englishTranscript = await storage.getTranscriptByModule(moduleId, "en");
      
      if (englishTranscript) {
        // Translate the transcript segments
        const translatedSegments = await Promise.all(
          (englishTranscript.segments as ContentSegment[]).map(async segment => {
            const translatedText = await translationService.translateText({
              text: segment.text,
              sourceLanguage: "en",
              targetLanguage: languageCode
            });
            
            return {
              ...segment,
              text: translatedText
            };
          })
        );
        
        // Create a "virtual" transcript (not stored in database)
        transcript = {
          id: -1, // Virtual ID
          moduleId,
          languageCode,
          segments: translatedSegments
        };
      }
    }
    
    if (!transcript) {
      throw new Error(`Transcript for module ${moduleId} not found`);
    }
    
    // Translate module information
    const [localizedTitle, localizedDescription] = await Promise.all([
      translationService.translateText({
        text: module.title,
        targetLanguage: languageCode
      }),
      translationService.translateText({
        text: module.description || "",
        targetLanguage: languageCode
      })
    ]);
    
    return {
      ...module,
      title: localizedTitle,
      description: localizedDescription,
      transcript: {
        id: transcript.id,
        segments: transcript.segments as ContentSegment[]
      }
    };
  }
  
  /**
   * Get quiz questions for a module in the requested language
   */
  async getLocalizedQuizQuestions(moduleId: number, languageCode: LanguageCode): Promise<LocalizedQuizQuestion[]> {
    // Try to get questions in requested language
    let questions = await storage.getQuizQuestionsByModule(moduleId, languageCode);
    
    // If no questions in requested language, get English and translate
    if (questions.length === 0) {
      const englishQuestions = await storage.getQuizQuestionsByModule(moduleId, "en");
      
      if (englishQuestions.length > 0) {
        // Translate the questions
        questions = await Promise.all(
          englishQuestions.map(async question => {
            const [
              translatedQuestionText,
              translatedExplanation,
              ...translatedOptions
            ] = await Promise.all([
              translationService.translateText({
                text: question.questionText,
                sourceLanguage: "en",
                targetLanguage: languageCode
              }),
              translationService.translateText({
                text: question.explanation || "",
                sourceLanguage: "en",
                targetLanguage: languageCode
              }),
              ...(question.options as string[]).map(option => 
                translationService.translateText({
                  text: option,
                  sourceLanguage: "en",
                  targetLanguage: languageCode
                })
              )
            ]);
            
            return {
              ...question,
              questionText: translatedQuestionText,
              explanation: translatedExplanation,
              options: translatedOptions,
              languageCode
            };
          })
        );
      }
    }
    
    return questions.map(q => ({
      id: q.id,
      moduleId: q.moduleId,
      questionText: q.questionText,
      options: q.options as string[],
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || "",
      appearanceTime: q.appearanceTime,
      difficulty: q.difficulty
    }));
  }
  
  /**
   * Generate a quiz question using LLM based on transcript content
   */
  async generateQuizQuestion(moduleId: number, languageCode: LanguageCode, difficulty: number = 1): Promise<LocalizedQuizQuestion> {
    // Get the module transcript
    const localizedModule = await this.getLocalizedModule(moduleId, languageCode);
    
    // Extract transcript text
    const transcriptText = localizedModule.transcript.segments
      .map(segment => segment.text)
      .join(" ");
    
    // Get existing questions to avoid duplication
    const existingQuestions = await this.getLocalizedQuizQuestions(moduleId, languageCode);
    const existingQuestionTexts = existingQuestions.map(q => q.questionText);
    
    // Generate new question using LLM
    const generatedQuestion = await llmService.generateQuestion({
      transcript: transcriptText,
      difficulty,
      previousQuestions: existingQuestionTexts,
      questionType: 'multiple_choice',
      language: languageCode
    });
    
    // For multiple choice questions
    if ('options' in generatedQuestion) {
      return {
        id: -1, // Virtual ID for generated question
        moduleId,
        questionText: generatedQuestion.questionText,
        options: generatedQuestion.options,
        correctOptionIndex: generatedQuestion.correctOptionIndex,
        explanation: generatedQuestion.explanation,
        difficulty
      };
    } else {
      // Convert short answer to multiple choice format
      return {
        id: -1, // Virtual ID for generated question
        moduleId,
        questionText: generatedQuestion.questionText,
        options: [
          generatedQuestion.sampleAnswer,
          `Incorrect answer based on ${generatedQuestion.keyPoints[0]}`,
          `Incorrect answer based on ${generatedQuestion.keyPoints[1] || generatedQuestion.keyPoints[0]}`,
          "None of the above"
        ],
        correctOptionIndex: 0,
        explanation: generatedQuestion.explanation,
        difficulty
      };
    }
  }
  
  /**
   * Create a summary of module content using LLM
   */
  async summarizeModule(moduleId: number, languageCode: LanguageCode): Promise<{ summary: string, keyPoints: string[] }> {
    // Get the module transcript
    const localizedModule = await this.getLocalizedModule(moduleId, languageCode);
    
    // Extract transcript text
    const transcriptText = localizedModule.transcript.segments
      .map(segment => segment.text)
      .join(" ");
    
    // Generate summary using LLM
    const summary = await llmService.summarizeContent({
      transcript: transcriptText,
      language: languageCode
    });
    
    return summary;
  }
}

export const contentService = new ContentService();
