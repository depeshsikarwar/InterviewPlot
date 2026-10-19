import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://depeshsikarwar@localhost:5432/interviewpilot_db?schema=public',
  
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_interviewpilot_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_key',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev_cookie_secret',

  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  AI_MODEL_NAME: process.env.AI_MODEL_NAME || 'gemini-1.5-flash',

  CODE_EXECUTION_ENGINE: process.env.CODE_EXECUTION_ENGINE || 'local',
  JUDGE0_API_URL: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY || '',

  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};
