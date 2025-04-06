export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-globalacademy.railway.app'  // URL вашего API после деплоя
  : 'http://localhost:5000';  // Локальный URL для разработки
