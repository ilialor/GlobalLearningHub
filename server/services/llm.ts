import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export interface FeedbackRequest {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  context: string;
  language: string;
}

export interface FeedbackResponse {
  message: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuestionGenerationRequest {
  transcript: string;
  difficulty: number; // 1-3 scale
  previousQuestions?: string[];
  questionType: 'multiple_choice' | 'short_answer';
  language: string;
  userPerformance?: {
    correctAnswers: number;
    totalQuestions: number;
  };
}

export interface MultipleChoiceQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ShortAnswerQuestion {
  questionText: string;
  sampleAnswer: string;
  keyPoints: string[];
  explanation: string;
}

export type GeneratedQuestion = MultipleChoiceQuestion | ShortAnswerQuestion;

export interface SummarizeRequest {
  transcript: string;
  language: string;
  sectionStart?: number;
  sectionEnd?: number;
}

export interface SummaryResponse {
  summary: string;
  keyPoints: string[];
}

class LLMService {
  private openai: OpenAI;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      console.warn("OPENAI_API_KEY not found, LLM features will not work correctly");
    }
    
    this.openai = new OpenAI({ apiKey });
  }
  
  async generateFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      const { question, userAnswer, correctAnswer, context, language } = request;
      
      const response = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are an expert educational tutor specializing in AI concepts. Your goal is to provide clear, concise, and encouraging feedback to learners in their native language. Respond in ${language} and analyze whether the user's answer is correct.`
          },
          {
            role: "user",
            content: `
              Context: ${context}
              
              Question: ${question}
              
              User's answer: ${userAnswer}
              
              Correct answer: ${correctAnswer}
              
              Please provide feedback on the user's answer in JSON format with the following fields:
              - message: A short encouragement message (correct or try again)
              - isCorrect: boolean indicating if the answer is correct
              - explanation: Detailed explanation of why the answer is correct/incorrect
            `
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content) as FeedbackResponse;
      return result;
    } catch (error) {
      console.error("Error generating feedback:", error);
      return {
        message: "We could not analyze your answer at this time",
        isCorrect: false,
        explanation: "There was an error processing your response. Please try again."
      };
    }
  }
  
  async generateQuestion(request: QuestionGenerationRequest): Promise<GeneratedQuestion> {
    try {
      const { transcript, difficulty, previousQuestions, questionType, language, userPerformance } = request;
      
      let difficultyText = "basic";
      if (difficulty === 2) difficultyText = "intermediate";
      if (difficulty === 3) difficultyText = "advanced";
      
      let performanceContext = "";
      if (userPerformance) {
        const performancePercentage = Math.round((userPerformance.correctAnswers / userPerformance.totalQuestions) * 100);
        performanceContext = `The learner has answered ${performancePercentage}% of previous questions correctly.`;
      }
      
      const previousQuestionsText = previousQuestions ? `Previous questions asked: ${previousQuestions.join("; ")}` : "";
      
      const response = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are an expert educational content creator specialized in generating high-quality assessment questions. Create a ${difficultyText} ${questionType} question in ${language} based on the provided transcript. The question should test comprehension and critical thinking.`
          },
          {
            role: "user",
            content: `
              Transcript: ${transcript}
              
              ${performanceContext}
              
              ${previousQuestionsText}
              
              Generate a ${difficultyText} level ${questionType} question about the key concepts in this transcript.
              
              ${questionType === 'multiple_choice' 
                ? 'Include 4 options where only one is correct. Make the distractors plausible but clearly incorrect upon careful reading.' 
                : 'Include a sample answer and key points that should be included in a good response.'}
              
              Return the result in the following JSON format:
              ${questionType === 'multiple_choice' 
                ? '{ "questionText": "", "options": ["", "", "", ""], "correctOptionIndex": 0-3, "explanation": "" }'
                : '{ "questionText": "", "sampleAnswer": "", "keyPoints": ["", ""], "explanation": "" }'}
            `
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content) as GeneratedQuestion;
      return result;
    } catch (error) {
      console.error("Error generating question:", error);
      
      if (request.questionType === 'multiple_choice') {
        return {
          questionText: "What is the main topic of the content?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOptionIndex: 0,
          explanation: "We could not generate a specific question at this time."
        };
      } else {
        return {
          questionText: "Summarize the main concepts from the content.",
          sampleAnswer: "A complete answer would describe the key points covered in the material.",
          keyPoints: ["Key concept 1", "Key concept 2"],
          explanation: "We could not generate a specific question at this time."
        };
      }
    }
  }
  
  async summarizeContent(request: SummarizeRequest): Promise<SummaryResponse> {
    try {
      const { transcript, language, sectionStart, sectionEnd } = request;
      
      let content = transcript;
      if (sectionStart !== undefined && sectionEnd !== undefined) {
        // Extract the portion of the transcript specified by time range
        // This would require parsing the transcript segments
        // For now, we'll just use the whole transcript
      }
      
      const response = await this.openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are an expert at summarizing educational content. Create a concise summary in ${language} of the provided transcript, highlighting the key points.`
          },
          {
            role: "user",
            content: `
              Transcript: ${content}
              
              Please provide a summary and key points in JSON format with the following structure:
              {
                "summary": "A concise summary of the content",
                "keyPoints": ["Key point 1", "Key point 2", "..."]
              }
            `
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content) as SummaryResponse;
      return result;
    } catch (error) {
      console.error("Error generating summary:", error);
      return {
        summary: "We could not generate a summary at this time.",
        keyPoints: ["Please try again later."]
      };
    }
  }
}

export const llmService = new LLMService();
