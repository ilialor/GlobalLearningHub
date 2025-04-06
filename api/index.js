// Adapter for Vercel Serverless Functions
import app from '../server/index.js';

// Handler for Vercel serverless environment with enhanced error handling
export default async function handler(req, res) {
  try {
    // Pass the request to the Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    
    // Return proper error response if Express doesn't handle it
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }
} 