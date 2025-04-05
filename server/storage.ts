import { 
  users, type User, type InsertUser,
  contentProviders, type ContentProvider, type InsertContentProvider, 
  courses, type Course, type InsertCourse,
  modules, type Module, type InsertModule,
  transcripts, type Transcript, type InsertTranscript,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  userProgress, type UserProgress, type InsertUserProgress,
  userQuizResults, type UserQuizResult, type InsertUserQuizResult,
  learningPaths, type LearningPath, type InsertLearningPath
} from "@shared/schema";

// Common interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Content Provider operations
  getContentProviders(): Promise<ContentProvider[]>;
  getContentProvider(id: number): Promise<ContentProvider | undefined>;
  createContentProvider(provider: InsertContentProvider): Promise<ContentProvider>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  getRecommendedCourses(userId: number, limit?: number): Promise<Course[]>;
  getCoursesByLearningPath(pathId: number): Promise<Course[]>;

  // Module operations
  getModulesByCourse(courseId: number): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;

  // Transcript operations
  getTranscriptByModule(moduleId: number, languageCode?: string): Promise<Transcript | undefined>;
  createTranscript(transcript: InsertTranscript): Promise<Transcript>;

  // Quiz Question operations
  getQuizQuestionsByModule(moduleId: number, languageCode?: string): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;

  // User Progress operations
  getUserProgress(userId: number, courseId?: number): Promise<UserProgress[]>;
  updateUserProgress(userId: number, moduleId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getWeeklyProgressForUser(userId: number): Promise<number>; // Returns hours

  // User Quiz Results operations
  saveUserQuizResult(result: InsertUserQuizResult): Promise<UserQuizResult>;
  getUserQuizResults(userId: number, moduleId?: number): Promise<UserQuizResult[]>;

  // Learning Path operations
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(id: number): Promise<LearningPath | undefined>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  getUserLearningPathProgress(userId: number, pathId: number): Promise<number>; // Returns percentage 0-100
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contentProviders: Map<number, ContentProvider>;
  private courses: Map<number, Course>;
  private modules: Map<number, Module>;
  private transcripts: Map<number, Transcript>;
  private quizQuestions: Map<number, QuizQuestion>;
  private userProgress: Map<number, UserProgress>;
  private userQuizResults: Map<number, UserQuizResult>;
  private learningPaths: Map<number, LearningPath>;
  
  private currentIds: {
    users: number;
    contentProviders: number;
    courses: number;
    modules: number;
    transcripts: number;
    quizQuestions: number;
    userProgress: number;
    userQuizResults: number;
    learningPaths: number;
  };

  constructor() {
    this.users = new Map();
    this.contentProviders = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.transcripts = new Map();
    this.quizQuestions = new Map();
    this.userProgress = new Map();
    this.userQuizResults = new Map();
    this.learningPaths = new Map();
    
    this.currentIds = {
      users: 1,
      contentProviders: 1,
      courses: 1,
      modules: 1,
      transcripts: 1,
      quizQuestions: 1,
      userProgress: 1,
      userQuizResults: 1,
      learningPaths: 1,
    };

    // Initialize with some demo data
    this.initDemoData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Content Provider operations
  async getContentProviders(): Promise<ContentProvider[]> {
    return Array.from(this.contentProviders.values());
  }

  async getContentProvider(id: number): Promise<ContentProvider | undefined> {
    return this.contentProviders.get(id);
  }

  async createContentProvider(insertProvider: InsertContentProvider): Promise<ContentProvider> {
    const id = this.currentIds.contentProviders++;
    const provider: ContentProvider = { ...insertProvider, id };
    this.contentProviders.set(id, provider);
    return provider;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentIds.courses++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }

  async getRecommendedCourses(userId: number, limit: number = 3): Promise<Course[]> {
    // In a real implementation, this would use user preferences, history, etc.
    // For MVP, return some courses sorted by rating
    return Array.from(this.courses.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  async getCoursesByLearningPath(pathId: number): Promise<Course[]> {
    const path = await this.getLearningPath(pathId);
    if (!path) return [];
    
    const courseIds = path.courses as number[];
    return courseIds.map(id => this.courses.get(id)!).filter(Boolean);
  }

  // Module operations
  async getModulesByCourse(courseId: number): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.position - b.position);
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentIds.modules++;
    const module: Module = { ...insertModule, id };
    this.modules.set(id, module);
    return module;
  }

  // Transcript operations
  async getTranscriptByModule(moduleId: number, languageCode: string = 'en'): Promise<Transcript | undefined> {
    return Array.from(this.transcripts.values()).find(
      transcript => transcript.moduleId === moduleId && transcript.languageCode === languageCode
    );
  }

  async createTranscript(insertTranscript: InsertTranscript): Promise<Transcript> {
    const id = this.currentIds.transcripts++;
    const transcript: Transcript = { ...insertTranscript, id };
    this.transcripts.set(id, transcript);
    return transcript;
  }

  // Quiz Question operations
  async getQuizQuestionsByModule(moduleId: number, languageCode: string = 'en'): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter(question => question.moduleId === moduleId && question.languageCode === languageCode);
  }

  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.currentIds.quizQuestions++;
    const question: QuizQuestion = { ...insertQuestion, id };
    this.quizQuestions.set(id, question);
    return question;
  }

  // User Progress operations
  async getUserProgress(userId: number, courseId?: number): Promise<UserProgress[]> {
    let progress = Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
    
    if (courseId) {
      progress = progress.filter(p => p.courseId === courseId);
    }
    
    return progress;
  }

  async updateUserProgress(userId: number, moduleId: number, progressData: Partial<InsertUserProgress>): Promise<UserProgress | undefined> {
    const existingProgress = Array.from(this.userProgress.values()).find(
      p => p.userId === userId && p.moduleId === moduleId
    );
    
    if (!existingProgress) return undefined;
    
    const updatedProgress = { ...existingProgress, ...progressData };
    this.userProgress.set(existingProgress.id, updatedProgress);
    return updatedProgress;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentIds.userProgress++;
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgress.set(id, progress);
    return progress;
  }

  async getWeeklyProgressForUser(userId: number): Promise<number> {
    const userProgressEntries = Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
    
    return userProgressEntries.reduce((total, entry) => total + (entry.weeklyHoursSpent || 0), 0);
  }

  // User Quiz Results operations
  async saveUserQuizResult(insertResult: InsertUserQuizResult): Promise<UserQuizResult> {
    const id = this.currentIds.userQuizResults++;
    const result: UserQuizResult = { ...insertResult, id };
    this.userQuizResults.set(id, result);
    return result;
  }

  async getUserQuizResults(userId: number, moduleId?: number): Promise<UserQuizResult[]> {
    let results = Array.from(this.userQuizResults.values())
      .filter(result => result.userId === userId);
    
    if (moduleId) {
      // Get question IDs for the module
      const questionIds = Array.from(this.quizQuestions.values())
        .filter(q => q.moduleId === moduleId)
        .map(q => q.id);
      
      results = results.filter(r => questionIds.includes(r.questionId));
    }
    
    return results;
  }

  // Learning Path operations
  async getLearningPaths(): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values());
  }

  async getLearningPath(id: number): Promise<LearningPath | undefined> {
    return this.learningPaths.get(id);
  }

  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const id = this.currentIds.learningPaths++;
    const path: LearningPath = { ...insertPath, id };
    this.learningPaths.set(id, path);
    return path;
  }

  async getUserLearningPathProgress(userId: number, pathId: number): Promise<number> {
    const path = await this.getLearningPath(pathId);
    if (!path) return 0;
    
    const courseIds = path.courses as number[];
    if (courseIds.length === 0) return 0;
    
    let completedCourses = 0;
    
    for (const courseId of courseIds) {
      const modules = await this.getModulesByCourse(courseId);
      if (modules.length === 0) continue;
      
      const modulesCompleted = await Promise.all(
        modules.map(async module => {
          const progress = Array.from(this.userProgress.values()).find(
            p => p.userId === userId && p.moduleId === module.id
          );
          return progress?.completed || false;
        })
      );
      
      const allModulesCompleted = modulesCompleted.every(Boolean);
      if (allModulesCompleted) completedCourses++;
    }
    
    return Math.round((completedCourses / courseIds.length) * 100);
  }

  // Initialize demo data for the application
  private initDemoData() {
    // Create content provider
    const openAIProvider: InsertContentProvider = {
      name: "OpenAI Academy",
      description: "High-quality educational content from OpenAI",
      apiEndpoint: "https://api.openai.com/academy",
    };
    this.createContentProvider(openAIProvider).then(provider => {
      // Create AI courses
      this.createCourse({
        title: "Introduction to AI",
        description: "Learn about the fundamental concepts of artificial intelligence, including machine learning, neural networks, and problem-solving approaches.",
        instructor: "Dr. Sarah Johnson",
        thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
        providerId: provider.id,
        rating: 4,
        ratingCount: 245,
        isNew: false
      }).then(course => {
        // Create modules
        this.createModule({
          courseId: course.id,
          title: "Introduction to AI Concepts",
          description: "Overview of key AI concepts and terminology",
          position: 1,
          videoUrl: "https://example.com/videos/ai-intro",
          durationSeconds: 950,
        }).then(module => {
          // Add transcript
          this.createTranscript({
            moduleId: module.id,
            languageCode: "en",
            segments: [
              { startTime: 0, endTime: 10, text: "Welcome to Introduction to AI. In this course, we'll explore the fascinating world of artificial intelligence." },
              { startTime: 10, endTime: 20, text: "Artificial Intelligence is a broad field that encompasses various approaches to creating machines that can perform tasks that typically require human intelligence." },
              { startTime: 20, endTime: 30, text: "The field has evolved significantly since its inception in the 1950s, with recent advances in deep learning revolutionizing what's possible." }
            ]
          });
          
          // Add quiz questions
          this.createQuizQuestion({
            moduleId: module.id,
            questionText: "What is artificial intelligence primarily concerned with?",
            options: [
              "Building physical robots",
              "Creating systems that can perform tasks requiring human intelligence",
              "Developing faster computer processors",
              "Programming basic computer functions"
            ],
            correctOptionIndex: 1,
            explanation: "Artificial intelligence is focused on creating systems that can perform tasks that would typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation.",
            languageCode: "en",
            appearanceTime: 35,
            difficulty: 1
          });
        });
        
        this.createModule({
          courseId: course.id,
          title: "History of AI",
          description: "The evolution of artificial intelligence research",
          position: 2,
          videoUrl: "https://example.com/videos/ai-history",
          durationSeconds: 1200,
        });
        
        this.createModule({
          courseId: course.id,
          title: "Basic Neural Networks",
          description: "Understanding the foundation of modern AI",
          position: 3,
          videoUrl: "https://example.com/videos/neural-networks",
          durationSeconds: 1500,
        });
        
        this.createModule({
          courseId: course.id,
          title: "Machine Learning Approaches",
          description: "Different types of machine learning and when to use them",
          position: 4,
          videoUrl: "https://example.com/videos/ml-approaches",
          durationSeconds: 945,
        }).then(module => {
          // Add transcript
          this.createTranscript({
            moduleId: module.id,
            languageCode: "en",
            segments: [
              { startTime: 300, endTime: 320, text: "Machine learning algorithms can be broadly categorized into three types: supervised learning, unsupervised learning, and reinforcement learning. Each serves a different purpose in the AI ecosystem." },
              { startTime: 325, endTime: 345, text: "In supervised learning, the algorithm is trained on a labeled dataset, which means we provide both the input data and the expected output. The algorithm learns to map the input to the output." },
              { startTime: 350, endTime: 370, text: "Examples of supervised learning algorithms include linear regression, logistic regression, decision trees, and neural networks. These are commonly used for classification and regression tasks." },
              { startTime: 375, endTime: 395, text: "Unsupervised learning, on the other hand, works with unlabeled data. The algorithm tries to find patterns or structure in the data without any explicit guidance on what to look for." }
            ]
          });
          
          // Add quiz questions
          this.createQuizQuestion({
            moduleId: module.id,
            questionText: "Which type of machine learning is used when we have labeled data for training?",
            options: [
              "Unsupervised Learning",
              "Supervised Learning",
              "Reinforcement Learning",
              "Transfer Learning"
            ],
            correctOptionIndex: 1,
            explanation: "Supervised learning uses labeled data where the model learns to map inputs to known outputs. This approach is suitable for classification and regression tasks.",
            languageCode: "en",
            appearanceTime: 345,
            difficulty: 1
          });
        });
      });
      
      this.createCourse({
        title: "Machine Learning Basics",
        description: "Introduction to machine learning algorithms and their applications in solving real-world problems.",
        instructor: "Dr. Michael Chen",
        thumbnailUrl: "https://images.unsplash.com/photo-1594904351111-a072f80b1a71",
        providerId: provider.id,
        rating: 4,
        ratingCount: 128,
        isNew: true
      });
      
      this.createCourse({
        title: "Neural Networks",
        description: "Explore the architecture and mathematics behind neural networks and deep learning models.",
        instructor: "Prof. James Wilson",
        thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
        providerId: provider.id,
        rating: 5,
        ratingCount: 245,
        isNew: false
      });
      
      this.createCourse({
        title: "Natural Language Processing",
        description: "Learn how machines understand, interpret, and generate human language.",
        instructor: "Dr. Emily Rodriguez",
        thumbnailUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
        providerId: provider.id,
        rating: 4,
        ratingCount: 176,
        isNew: false
      });
    });
    
    // Create learning paths
    this.createLearningPath({
      title: "Artificial Intelligence",
      description: "A comprehensive path to master AI fundamentals",
      icon: "blur_on",
      courses: [1, 3, 4]
    });
    
    this.createLearningPath({
      title: "Machine Learning",
      description: "Focused learning path for machine learning specialists",
      icon: "psychology",
      courses: [2, 3]
    });
    
    this.createLearningPath({
      title: "Deep Learning",
      description: "Advanced techniques in neural networks and deep learning",
      icon: "device_hub",
      courses: [3, 4]
    });
    
    // Create demo user
    this.createUser({
      username: "john.smith",
      password: "password123", // In a real app, this would be hashed
      displayName: "John Smith",
      email: "john.smith@example.com",
      preferredLanguage: "en",
      weeklyGoalHours: 4
    }).then(user => {
      // Add some progress for the demo user
      this.createUserProgress({
        userId: user.id,
        courseId: 1,
        moduleId: 1,
        lastPosition: 950,
        completed: true,
        completedAt: new Date(),
        weeklyHoursSpent: 1
      });
      
      this.createUserProgress({
        userId: user.id,
        courseId: 1,
        moduleId: 2,
        lastPosition: 1200,
        completed: true,
        completedAt: new Date(),
        weeklyHoursSpent: 1
      });
      
      this.createUserProgress({
        userId: user.id,
        courseId: 1,
        moduleId: 3,
        lastPosition: 950,
        completed: true,
        completedAt: new Date(),
        weeklyHoursSpent: 1
      });
      
      this.createUserProgress({
        userId: user.id,
        courseId: 1,
        moduleId: 4,
        lastPosition: 350,
        completed: false,
        weeklyHoursSpent: 0
      });
    });
  }
}

export const storage = new MemStorage();
