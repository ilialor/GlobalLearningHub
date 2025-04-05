import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contentService } from "./services/content";
import { llmService } from "./services/llm";
import { translationService, languageCodeSchema, SUPPORTED_LANGUAGES } from "./services/translation";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'globalacademy_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: 'Incorrect username' });
      if (user.password !== password) return done(null, false, { message: 'Incorrect password' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Auth Routes
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        displayName: z.string().min(1),
        email: z.string().email(),
        preferredLanguage: languageCodeSchema.default('en'),
      });
      
      const userData = userSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const newUser = await storage.createUser(userData);
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        return res.status(201).json({ user: newUser });
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.get('/api/auth/current-user', (req, res) => {
    if (req.user) {
      const user = req.user as any;
      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        preferredLanguage: user.preferredLanguage
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // User routes
  app.get('/api/user/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user progress' });
    }
  });

  app.get('/api/user/weekly-progress', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const hours = await storage.getWeeklyProgressForUser(userId);
      const user = await storage.getUser(userId);
      const goal = user?.weeklyGoalHours || 4;
      
      res.json({
        currentHours: hours,
        goalHours: goal,
        percentage: Math.min(100, Math.round((hours / goal) * 100))
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weekly progress' });
    }
  });

  app.put('/api/user/language', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const schema = z.object({
        language: languageCodeSchema
      });
      
      const { language } = schema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, {
        preferredLanguage: language
      });
      
      res.json({ success: true, preferredLanguage: updatedUser?.preferredLanguage });
    } catch (error) {
      res.status(400).json({ message: 'Invalid language code' });
    }
  });

  // Content routes
  app.get('/api/courses', async (req, res) => {
    try {
      const languageCode = req.query.language as string || 'en';
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(languageCode);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      const courses = await contentService.getLocalizedCourses(parsedLanguage.data);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const languageCode = req.query.language as string || 'en';
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(languageCode);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      const course = await contentService.getLocalizedCourseDetail(courseId, parsedLanguage.data);
      res.json(course);
    } catch (error) {
      res.status(404).json({ message: 'Course not found' });
    }
  });

  app.get('/api/modules/:id', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const languageCode = req.query.language as string || 'en';
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(languageCode);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      const module = await contentService.getLocalizedModule(moduleId, parsedLanguage.data);
      res.json(module);
    } catch (error) {
      res.status(404).json({ message: 'Module not found' });
    }
  });

  app.get('/api/modules/:id/questions', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const languageCode = req.query.language as string || 'en';
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(languageCode);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      const questions = await contentService.getLocalizedQuizQuestions(moduleId, parsedLanguage.data);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  });

  app.post('/api/modules/:id/generate-question', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const { language = 'en', difficulty = 1 } = req.body;
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(language);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      // Validate difficulty
      const parsedDifficulty = z.number().min(1).max(3).safeParse(difficulty);
      if (!parsedDifficulty.success) {
        return res.status(400).json({ message: 'Difficulty must be between 1 and 3' });
      }
      
      const question = await contentService.generateQuizQuestion(
        moduleId, 
        parsedLanguage.data, 
        parsedDifficulty.data
      );
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate question' });
    }
  });

  app.post('/api/modules/:id/summarize', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const { language = 'en' } = req.body;
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(language);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      const summary = await contentService.summarizeModule(moduleId, parsedLanguage.data);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate summary' });
    }
  });

  app.post('/api/quiz/answer', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const schema = z.object({
        questionId: z.number(),
        selectedOption: z.number(),
        moduleId: z.number(),
      });
      
      const { questionId, selectedOption, moduleId } = schema.parse(req.body);
      
      // Get the question to check correctness
      const questions = await storage.getQuizQuestionsByModule(moduleId);
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      const isCorrect = question.correctOptionIndex === selectedOption;
      
      // Save result
      const result = await storage.saveUserQuizResult({
        userId,
        questionId,
        selectedOption,
        isCorrect,
        attemptedAt: new Date()
      });
      
      // If correct, update progress
      if (isCorrect) {
        // Get course ID from module
        const module = await storage.getModule(moduleId);
        if (module) {
          // Check if progress entry exists
          const progressEntries = await storage.getUserProgress(userId, module.courseId);
          const existingProgress = progressEntries.find(p => p.moduleId === moduleId);
          
          if (existingProgress) {
            // Update existing progress
            await storage.updateUserProgress(userId, moduleId, {
              weeklyHoursSpent: (existingProgress.weeklyHoursSpent || 0) + 0.1, // Add 6 minutes for completing a quiz
            });
          } else {
            // Create new progress
            await storage.createUserProgress({
              userId,
              courseId: module.courseId,
              moduleId,
              lastPosition: 0,
              completed: false,
              weeklyHoursSpent: 0.1
            });
          }
        }
      }
      
      res.json({
        isCorrect,
        correctOptionIndex: question.correctOptionIndex,
        explanation: question.explanation
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid quiz answer submission' });
    }
  });

  app.post('/api/quiz/feedback', async (req, res) => {
    try {
      const schema = z.object({
        question: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
        context: z.string(),
        language: languageCodeSchema.default('en')
      });
      
      const feedbackRequest = schema.parse(req.body);
      
      const feedback = await llmService.generateFeedback(feedbackRequest);
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ message: 'Invalid feedback request' });
    }
  });

  app.post('/api/progress/update', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const schema = z.object({
        moduleId: z.number(),
        courseId: z.number(),
        lastPosition: z.number(),
        completed: z.boolean().optional(),
        timeSpent: z.number().optional() // minutes spent in this session
      });
      
      const { moduleId, courseId, lastPosition, completed, timeSpent } = schema.parse(req.body);
      
      // Check if progress entry exists
      const progressEntries = await storage.getUserProgress(userId, courseId);
      const existingProgress = progressEntries.find(p => p.moduleId === moduleId);
      
      let updatedProgress;
      
      if (existingProgress) {
        // Calculate weekly hours spent
        const additionalHours = timeSpent ? timeSpent / 60 : 0;
        const totalWeeklyHours = (existingProgress.weeklyHoursSpent || 0) + additionalHours;
        
        // Update existing progress
        updatedProgress = await storage.updateUserProgress(userId, moduleId, {
          lastPosition,
          completed: completed !== undefined ? completed : existingProgress.completed,
          completedAt: completed ? new Date() : existingProgress.completedAt,
          weeklyHoursSpent: totalWeeklyHours
        });
      } else {
        // Create new progress
        updatedProgress = await storage.createUserProgress({
          userId,
          courseId,
          moduleId,
          lastPosition,
          completed: completed || false,
          completedAt: completed ? new Date() : undefined,
          weeklyHoursSpent: timeSpent ? timeSpent / 60 : 0
        });
      }
      
      res.json(updatedProgress);
    } catch (error) {
      res.status(400).json({ message: 'Invalid progress update' });
    }
  });

  app.get('/api/recommendations', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string || '3');
      const languageCode = req.query.language as string || 'en';
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(languageCode);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      // Get recommended courses
      const courses = await storage.getRecommendedCourses(userId, limit);
      
      // Localize courses
      const localizedCourses = await Promise.all(
        courses.map(async course => {
          const [title, description] = await Promise.all([
            translationService.translateText({
              text: course.title,
              targetLanguage: parsedLanguage.data
            }),
            translationService.translateText({
              text: course.description,
              targetLanguage: parsedLanguage.data
            })
          ]);
          
          const provider = await storage.getContentProvider(course.providerId);
          
          return {
            ...course,
            title,
            description,
            providerName: provider?.name || 'Unknown Provider'
          };
        })
      );
      
      res.json(localizedCourses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
  });

  app.get('/api/learning-paths', async (req, res) => {
    try {
      const languageCode = req.query.language as string || 'en';
      
      // Validate language code
      const parsedLanguage = languageCodeSchema.safeParse(languageCode);
      if (!parsedLanguage.success) {
        return res.status(400).json({ message: 'Invalid language code' });
      }
      
      const paths = await storage.getLearningPaths();
      
      // Localize learning paths
      const localizedPaths = await Promise.all(
        paths.map(async path => {
          const [title, description] = await Promise.all([
            translationService.translateText({
              text: path.title,
              targetLanguage: parsedLanguage.data
            }),
            translationService.translateText({
              text: path.description || '',
              targetLanguage: parsedLanguage.data
            })
          ]);
          
          return {
            ...path,
            title,
            description
          };
        })
      );
      
      res.json(localizedPaths);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch learning paths' });
    }
  });

  app.get('/api/learning-paths/:id/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const pathId = parseInt(req.params.id);
      
      const percentage = await storage.getUserLearningPathProgress(userId, pathId);
      
      res.json({ percentage });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch learning path progress' });
    }
  });

  app.get('/api/languages', (req, res) => {
    res.json(SUPPORTED_LANGUAGES);
  });

  // Create the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
