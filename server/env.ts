// This file MUST be imported first to load environment variables
// before any other modules that depend on them

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('📦 Environment loaded');
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set (emails will be logged to console)'}`);
console.log(`   APP_URL: ${process.env.APP_URL || 'http://localhost:5173 (default)'}`);


