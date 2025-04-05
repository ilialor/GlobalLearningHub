import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  weeklyGoalHours: integer("weekly_goal_hours").default(4),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  preferredLanguage: true,
  weeklyGoalHours: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Content providers schema
export const contentProviders = pgTable("content_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  apiEndpoint: text("api_endpoint"),
});

export const insertContentProviderSchema = createInsertSchema(contentProviders);
export type InsertContentProvider = z.infer<typeof insertContentProviderSchema>;
export type ContentProvider = typeof contentProviders.$inferSelect;

// Courses schema
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  providerId: integer("provider_id").notNull(),
  rating: integer("rating").default(0), // 0-5 rating
  ratingCount: integer("rating_count").default(0),
  isNew: boolean("is_new").default(false),
});

export const insertCourseSchema = createInsertSchema(courses);
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Course modules schema
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  videoUrl: text("video_url").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
});

export const insertModuleSchema = createInsertSchema(modules);
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// Module transcripts schema
export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  languageCode: text("language_code").notNull().default("en"),
  segments: jsonb("segments").notNull(), // Array of {startTime, endTime, text}
});

export const insertTranscriptSchema = createInsertSchema(transcripts);
export type InsertTranscript = z.infer<typeof insertTranscriptSchema>;
export type Transcript = typeof transcripts.$inferSelect;

// Quiz questions schema
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // Array of options
  correctOptionIndex: integer("correct_option_index").notNull(),
  explanation: text("explanation"),
  languageCode: text("language_code").notNull().default("en"),
  appearanceTime: integer("appearance_time"), // seconds into the video
  difficulty: integer("difficulty").default(1), // 1-3 scale for difficulty
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions);
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

// User progress schema
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  moduleId: integer("module_id").notNull(),
  lastPosition: integer("last_position").default(0), // seconds into the video
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  weeklyHoursSpent: integer("weekly_hours_spent").default(0),
});

export const insertUserProgressSchema = createInsertSchema(userProgress);
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// User quiz results schema
export const userQuizResults = pgTable("user_quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedOption: integer("selected_option").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

export const insertUserQuizResultSchema = createInsertSchema(userQuizResults);
export type InsertUserQuizResult = z.infer<typeof insertUserQuizResultSchema>;
export type UserQuizResult = typeof userQuizResults.$inferSelect;

// Learning paths schema
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").notNull(), // Material icon name
  courses: jsonb("courses").notNull(), // Array of course IDs in sequence
});

export const insertLearningPathSchema = createInsertSchema(learningPaths);
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;
