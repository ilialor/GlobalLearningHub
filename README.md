# GlobalAcademy - Multilingual Personalized Learning Platform

GlobalAcademy is a modern educational platform designed to provide personalized learning content in multiple languages. The platform combines cutting-edge technologies to create an interactive and adaptive learning experience.

## Features

- **Multilingual Support**: Access educational content in English, Spanish, French, and Chinese
- **Personalized Learning Paths**: Individualized learning journeys tailored to each user's interests and pace
- **AI-Powered Interactive Quizzes**: Automatically generated questions with personalized feedback powered by OpenAI
- **Localized Content**: Support for diverse content providers with localized materials
- **Learning Progress**: Tracking and visualization of learning progress to achieve educational goals

## Technologies

- **Frontend**: React with TypeScript, Tailwind CSS for styling, and shadcn/ui for UI components
- **Backend**: Node.js with Express providing a RESTful API
- **Data Storage**: Using in-memory storage or PostgreSQL for persistent storage
- **AI Integration**: OpenAI API for quiz generation, feedback, and content summarization
- **Internationalization**: Built-in i18n support with translation API capabilities

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- OpenAI API key for AI capabilities

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/ilialor/globalacademy.git
   cd globalacademy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the necessary environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the application:
   ```
   npm run dev
   ```

5. Open [http://localhost:5000](http://localhost:5000) in your browser.

## Project Structure

- `/client` - React frontend code
  - `/src/components` - React components
  - `/src/pages` - Page components
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Helper functions and utilities
  - `/src/locales` - Localization files (translations)

- `/server` - Node.js backend code
  - `/services` - Business logic services
  - `/routes.ts` - API routes
  - `/storage.ts` - Data storage logic

- `/shared` - Code used by both frontend and backend
  - `/schema.ts` - Type definitions and data schemas

## Architecture

### Frontend

The frontend is built using React and organized as a Single Page Application. It uses:

- **TanStack Query**: For state management and API request caching
- **Wouter**: For client-side routing
- **i18next**: For managing multiple languages
- **React Hook Form**: For form handling and validation

### Backend

The backend is built on Express.js and provides a RESTful API for the client. It uses:

- **Drizzle ORM**: For database interactions
- **OpenAI**: For AI-powered features
- **In-Memory Storage**: For quick data storage during development

## Contributing

We welcome contributions to GlobalAcademy! If you would like to contribute, please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add some amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

If you have any questions or suggestions, please contact us at support@globalacademy.example.com.
