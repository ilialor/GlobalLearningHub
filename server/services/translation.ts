import { z } from "zod";

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文",
  ru: "Русский",
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const languageCodeSchema = z.enum(["en", "es", "fr", "zh", "ru"]);

interface TranslationRequest {
  text: string;
  sourceLanguage?: LanguageCode;
  targetLanguage: LanguageCode;
}

// Cache structure to store translations
interface CachedTranslation {
  sourceText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  translatedText: string;
  timestamp: Date;
}

class TranslationService {
  private translationCache: CachedTranslation[] = [];
  private cacheExpiryDays = 30; // Cache translations for 30 days
  
  constructor() {
    // Initialize with any environment variables
    this.configureService();
  }
  
  private configureService() {
    // Would set up API keys, etc. from env vars
    const apiKey = process.env.TRANSLATION_API_KEY;
    if (!apiKey) {
      console.warn("No translation API key found. Translation service will use fallback methods.");
    }
  }
  
  /**
   * Translate text to the target language
   */
  async translateText(request: TranslationRequest): Promise<string> {
    const { text, sourceLanguage = "en", targetLanguage } = request;
    
    // If source and target are the same, return original text
    if (sourceLanguage === targetLanguage) {
      return text;
    }
    
    // Check cache first
    const cachedResult = this.checkCache(text, sourceLanguage, targetLanguage);
    if (cachedResult) {
      return cachedResult;
    }
    
    try {
      // In a real implementation, this would call a translation API like DeepL or Google Translate
      // For the MVP, we'll use a simple fallback method
      const translatedText = await this.fallbackTranslation(text, sourceLanguage, targetLanguage);
      
      // Cache the result
      this.cacheTranslation({
        sourceText: text,
        sourceLanguage,
        targetLanguage,
        translatedText,
        timestamp: new Date()
      });
      
      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text; // Return original text on error
    }
  }
  
  /**
   * Check if a translation is already cached
   */
  private checkCache(text: string, sourceLanguage: LanguageCode, targetLanguage: LanguageCode): string | null {
    // Clean expired cache entries
    this.cleanExpiredCache();
    
    // Look for matching cached translation
    const cached = this.translationCache.find(entry => 
      entry.sourceText === text && 
      entry.sourceLanguage === sourceLanguage && 
      entry.targetLanguage === targetLanguage
    );
    
    return cached ? cached.translatedText : null;
  }
  
  /**
   * Add a translation to the cache
   */
  private cacheTranslation(translation: CachedTranslation): void {
    this.translationCache.push(translation);
    
    // Keep cache size reasonable
    if (this.translationCache.length > 1000) {
      // Remove oldest entries
      this.translationCache.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      this.translationCache = this.translationCache.slice(-500);
    }
  }
  
  /**
   * Remove expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = new Date();
    const expiryTime = now.getTime() - (this.cacheExpiryDays * 24 * 60 * 60 * 1000);
    
    this.translationCache = this.translationCache.filter(
      entry => entry.timestamp.getTime() > expiryTime
    );
  }
  
  /**
   * Fallback translation method when API is not available
   * This is a simplified placeholder that would be replaced with actual API calls
   */
  private async fallbackTranslation(text: string, sourceLanguage: LanguageCode, targetLanguage: LanguageCode): Promise<string> {
    // This is a very basic placeholder - in a real app, you'd use a proper translation API
    // These translations would also come from proper localization files
    
    // For demonstration purposes only - not a real translation solution
    const demoTranslations: Record<string, Record<LanguageCode, string>> = {
      "Welcome to Introduction to AI": {
        en: "Welcome to Introduction to AI",
        es: "Bienvenido a Introducción a la IA",
        fr: "Bienvenue à l'Introduction à l'IA",
        zh: "欢迎来到人工智能介绍",
        ru: "Добро пожаловать в Введение в ИИ"
      },
      "Machine Learning Basics": {
        en: "Machine Learning Basics",
        es: "Fundamentos de Aprendizaje Automático",
        fr: "Bases de l'Apprentissage Automatique",
        zh: "机器学习基础",
        ru: "Основы Машинного Обучения"
      },
      "Artificial Intelligence": {
        en: "Artificial Intelligence",
        es: "Inteligencia Artificial",
        fr: "Intelligence Artificielle",
        zh: "人工智能",
        ru: "Искусственный Интеллект"
      },
      "Introduction to AI": {
        en: "Introduction to AI",
        es: "Introducción a la IA",
        fr: "Introduction à l'IA",
        zh: "人工智能简介",
        ru: "Введение в ИИ"
      }
    };
    
    // If we have a demo translation, use it
    if (demoTranslations[text]?.[targetLanguage]) {
      return demoTranslations[text][targetLanguage];
    }
    
    // Otherwise return the original text with a marker
    return `[${targetLanguage}] ${text}`;
  }
}

export const translationService = new TranslationService();
