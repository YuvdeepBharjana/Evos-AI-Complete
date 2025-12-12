// MUST be first - loads environment variables before other imports
import './env.js';

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

import { db } from './db.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  generateToken,
  completeOnboarding,
  authMiddleware,
  optionalAuthMiddleware,
  type AuthRequest,
  type User
} from './auth.js';
import {
  chat,
  analyzeIdentity,
  generateDailyActions,
  generateSummary,
  isAIAvailable,
  SYSTEM_PROMPTS,
  MENTOR_STYLE_PROMPTS,
  type AIMentorStyle
} from './ai.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  isEmailConfigured
} from './email.js';
import crypto from 'crypto';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// CORS configuration - allow frontend domain
const allowedOrigins = [
  'https://evosai.ca',
  'https://www.evosai.ca',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ============================================
// HEALTH & STATUS
// ============================================

app.get('/', (req, res) => {
  res.json({
    service: 'Evos AI API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: 'See API documentation'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiAvailable: isAIAvailable(),
    version: '1.0.0'
  });
});

// Development endpoint to clear rate limits
app.post('/api/dev/clear-rate-limit', (req, res) => {
  const { ip } = req.body;
  const targetIp = ip || req.ip || req.socket.remoteAddress || 'unknown';
  
  clearRateLimit(targetIp);
  
  res.json({ 
    success: true, 
    message: `Rate limit cleared for IP: ${targetIp}`,
    tip: 'If still blocked, try clearing all: send empty request body'
  });
});

// Clear all rate limits (development)
app.post('/api/dev/clear-all-rate-limits', (req, res) => {
  rateLimitMap.clear();
  res.json({ 
    success: true, 
    message: 'All rate limits cleared'
  });
});

// ============================================
// AUTHENTICATION
// ============================================

// Rate limiting map (basic in-memory)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50; // max attempts (increased for better UX)
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

// Password validation
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }
  return { valid: true };
}

// Email validation
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many attempts. Please wait a minute and try again.' });
    }
    
    const { email, password, name, acceptedTerms } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
    }
    
    // Check if terms were accepted (required for GDPR)
    if (!acceptedTerms) {
      return res.status(400).json({ error: 'You must accept the terms of service and privacy policy' });
    }
    
    const existing = findUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    
    const user = await createUser(email.toLowerCase().trim(), password, name.trim());
    const token = generateToken(user);
    
    console.log(`New user registered: ${email}`);
    
    res.json({ 
      user, 
      token,
      message: 'Account created successfully. Your data is encrypted and protected.'
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many login attempts. Please wait a minute and try again.' });
    }
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      // Use same error message to prevent email enumeration
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Clear rate limit on successful login
    clearRateLimit(ip);
    
    const { password_hash, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);
    
    res.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// ============================================
// EMAIL VERIFICATION & PASSWORD RESET
// ============================================

// Request email verification (resend)
app.post('/api/auth/resend-verification', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = findUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    db.prepare(`
      INSERT INTO email_tokens (id, user_id, token, type, expires_at)
      VALUES (?, ?, ?, 'verification', ?)
    `).run(uuidv4(), user.id, token, expiresAt.toISOString());
    
    await sendVerificationEmail(user.email, token, user.name);
    
    res.json({ message: 'Verification email sent' });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Verify email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const tokenRecord = db.prepare(`
      SELECT * FROM email_tokens 
      WHERE token = ? AND type = 'verification' AND used = 0 AND expires_at > datetime('now')
    `).get(token) as any;
    
    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Mark token as used and verify email
    db.prepare('UPDATE email_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);
    db.prepare(`
      UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(tokenRecord.user_id);
    
    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = findUserByEmail(email.toLowerCase().trim());
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset email has been sent' });
    }
    
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    db.prepare(`
      INSERT INTO email_tokens (id, user_id, token, type, expires_at)
      VALUES (?, ?, ?, 'password_reset', ?)
    `).run(uuidv4(), user.id, token, expiresAt.toISOString());
    
    await sendPasswordResetEmail(user.email, token, user.name);
    
    res.json({ message: 'If an account exists, a reset email has been sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    const tokenRecord = db.prepare(`
      SELECT * FROM email_tokens 
      WHERE token = ? AND type = 'password_reset' AND used = 0 AND expires_at > datetime('now')
    `).get(token) as any;
    
    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Hash new password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Update password and mark token as used
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, tokenRecord.user_id);
    db.prepare('UPDATE email_tokens SET used = 1 WHERE id = ?').run(tokenRecord.id);
    
    // Invalidate all other reset tokens for this user
    db.prepare(`
      UPDATE email_tokens SET used = 1 
      WHERE user_id = ? AND type = 'password_reset' AND used = 0
    `).run(tokenRecord.user_id);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ============================================
// DATA PROTECTION & GDPR COMPLIANCE
// ============================================

// Export all user data
app.get('/api/user/data-export', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Collect all user data
    const userData = {
      profile: req.user,
      nodes: db.prepare('SELECT * FROM nodes WHERE user_id = ?').all(userId),
      tracking: db.prepare('SELECT * FROM daily_tracking WHERE user_id = ?').all(userId),
      actions: db.prepare('SELECT * FROM daily_actions WHERE user_id = ?').all(userId),
      chatHistory: db.prepare('SELECT * FROM chat_messages WHERE user_id = ?').all(userId),
      summaries: db.prepare('SELECT * FROM daily_summaries WHERE user_id = ?').all(userId),
      exportedAt: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="evos-data-export-${Date.now()}.json"`);
    res.json(userData);
  } catch (error: any) {
    console.error('Data export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Delete all user data
app.delete('/api/user/delete-account', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { password, confirmation } = req.body;
    const userId = req.user!.id;
    
    // Require confirmation text
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ 
        error: 'Please type "DELETE MY ACCOUNT" to confirm' 
      });
    }
    
    // Verify password for non-demo users
    const user = findUserById(userId);
    if (user && user.email !== 'demo@evos.ai') {
      if (!password) {
        return res.status(400).json({ error: 'Password is required to delete your account' });
      }
      
      const userWithPassword = findUserById(userId, true);
      if (!userWithPassword?.password_hash) {
        return res.status(500).json({ error: 'Failed to verify password' });
      }
      
      const valid = await verifyPassword(password, userWithPassword.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }
    
    // Delete all user data (cascade would be better but this is explicit)
    db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM daily_summaries WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM daily_actions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM daily_tracking WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM work_session_messages WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM work_sessions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM milestones WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM node_connections WHERE source_id IN (SELECT id FROM nodes WHERE user_id = ?) OR target_id IN (SELECT id FROM nodes WHERE user_id = ?)').run(userId, userId);
    db.prepare('DELETE FROM nodes WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM email_tokens WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    console.log(`User account deleted: ${req.user!.email}`);
    
    res.json({ 
      success: true, 
      message: 'Your account and all associated data have been permanently deleted.' 
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Delete specific data types
app.delete('/api/user/data/:type', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { type } = req.params;
    const userId = req.user!.id;
    
    const validTypes: Record<string, string> = {
      'chat': 'chat_messages',
      'tracking': 'daily_tracking',
      'actions': 'daily_actions',
      'summaries': 'daily_summaries'
    };
    
    if (!validTypes[type]) {
      return res.status(400).json({ error: 'Invalid data type' });
    }
    
    const table = validTypes[type];
    const result = db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(userId);
    
    res.json({ 
      success: true, 
      deleted: result.changes,
      message: `${result.changes} ${type} records deleted` 
    });
  } catch (error: any) {
    console.error('Delete data error:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// Privacy settings
app.get('/api/user/privacy', authMiddleware, (req: AuthRequest, res) => {
  res.json({
    dataRetention: 'Your data is stored securely until you delete it',
    encryption: 'Passwords are hashed with bcrypt (12 rounds)',
    sharing: 'We never sell or share your personal data',
    aiTraining: 'Your data is NOT used to train AI models',
    deletion: 'You can delete all your data at any time',
    export: 'You can export all your data in JSON format'
  });
});

// Demo login (for easy testing)
app.post('/api/auth/demo', async (req, res) => {
  try {
    const demoEmail = 'demo@evos.ai';
    let user = findUserByEmail(demoEmail);
    
    if (!user) {
      // Create demo user with pre-populated data
      const newUser = await createUser(demoEmail, 'demo@evos.ai', 'Demo User');
      completeOnboarding(newUser.id, 'demo');
      
      // Add demo nodes
      const demoNodes = [
        { label: 'Launch MVP', type: 'goal', strength: 85 },
        { label: 'Secure Seed Funding', type: 'goal', strength: 70 },
        { label: 'Build a Great Team', type: 'goal', strength: 65 },
        { label: 'Daily Standups', type: 'habit', strength: 90, status: 'mastered' },
        { label: 'Morning Meditation', type: 'habit', strength: 75 },
        { label: 'Deep Work Blocks', type: 'habit', strength: 60 },
        { label: 'Weekly Reflection', type: 'habit', strength: 55 },
        { label: 'Resilience', type: 'trait', strength: 85, status: 'mastered' },
        { label: 'Visionary Thinking', type: 'trait', strength: 80, status: 'mastered' },
        { label: 'Perfectionism', type: 'trait', strength: 70 },
        { label: 'Delegation', type: 'struggle', strength: 45 },
        { label: 'Work-Life Balance', type: 'struggle', strength: 40 },
        { label: 'Imposter Syndrome', type: 'struggle', strength: 35 },
        { label: 'Determination', type: 'emotion', strength: 90, status: 'mastered' },
        { label: 'Excitement', type: 'emotion', strength: 80 },
        { label: 'Anxiety', type: 'emotion', strength: 50 },
      ];
      
      const insertNode = db.prepare(`
        INSERT INTO nodes (id, user_id, label, type, strength, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const node of demoNodes) {
        insertNode.run(
          uuidv4(),
          newUser.id,
          node.label,
          node.type,
          node.strength,
          node.status || (node.strength >= 80 ? 'mastered' : node.strength >= 60 ? 'active' : 'developing')
        );
      }
      
      user = findUserByEmail(demoEmail);
    }
    
    const { password_hash, ...userWithoutPassword } = user!;
    const token = generateToken(userWithoutPassword);
    
    res.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ONBOARDING
// ============================================

app.post('/api/onboarding/complete', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { method, nodes } = req.body;
    const userId = req.user!.id;
    
    // Save nodes
    if (nodes && nodes.length > 0) {
      const insertNode = db.prepare(`
        INSERT INTO nodes (id, user_id, label, type, strength, status, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const node of nodes) {
        insertNode.run(
          node.id || uuidv4(),
          userId,
          node.label,
          node.type,
          node.strength || 50,
          node.status || 'developing',
          node.description || null
        );
      }
    }
    
    completeOnboarding(userId, method);
    
    const updatedUser = findUserById(userId);
    res.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze uploaded text
app.post('/api/onboarding/analyze', optionalAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.length < 100) {
      return res.status(400).json({ error: 'Text must be at least 100 characters' });
    }
    
    const analysis = await analyzeIdentity(text);
    res.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// IDENTITY NODES
// ============================================

// Get user's nodes
app.get('/api/nodes', authMiddleware, (req: AuthRequest, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM nodes WHERE user_id = ? ORDER BY type, strength DESC
    `);
    const nodes = stmt.all(req.user!.id);
    res.json({ nodes });
  } catch (error: any) {
    console.error('Get nodes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create node
app.post('/api/nodes', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { label, type, strength, status, description } = req.body;
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO nodes (id, user_id, label, type, strength, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user!.id, label, type, strength || 50, status || 'developing', description);
    
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
    res.json({ node });
  } catch (error: any) {
    console.error('Create node error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk create nodes (for onboarding)
app.post('/api/nodes/bulk', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { nodes } = req.body;
    
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ error: 'Nodes array is required' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO nodes (id, user_id, label, type, strength, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const createdNodes: any[] = [];
    
    const insertMany = db.transaction((nodesToInsert: any[]) => {
      for (const node of nodesToInsert) {
        const id = node.id || uuidv4();
        const status = node.strength >= 80 ? 'mastered' : 
                      node.strength >= 50 ? 'active' : 
                      node.strength >= 20 ? 'developing' : 'neglected';
        
        stmt.run(
          id,
          req.user!.id,
          node.label,
          node.type,
          node.strength || 50,
          status,
          node.description || null
        );
        
        createdNodes.push({
          id,
          label: node.label,
          type: node.type,
          strength: node.strength || 50,
          status,
          description: node.description
        });
      }
    });
    
    insertMany(nodes);
    
    res.json({ nodes: createdNodes, count: createdNodes.length });
  } catch (error: any) {
    console.error('Bulk create nodes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Complete onboarding
app.post('/api/onboarding/complete', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { method, nodes } = req.body;
    
    if (!method || !['questionnaire', 'upload', 'manual'].includes(method)) {
      return res.status(400).json({ error: 'Valid onboarding method is required' });
    }
    
    // Update user's onboarding status
    db.prepare(`
      UPDATE users 
      SET onboarding_complete = 1, onboarding_method = ?
      WHERE id = ?
    `).run(method, req.user!.id);
    
    // If nodes provided, create them
    if (Array.isArray(nodes) && nodes.length > 0) {
      // First, delete any existing nodes for this user (clean slate for onboarding)
      db.prepare('DELETE FROM nodes WHERE user_id = ?').run(req.user!.id);
      
      const stmt = db.prepare(`
        INSERT INTO nodes (id, user_id, label, type, strength, status, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const insertMany = db.transaction((nodesToInsert: any[]) => {
        for (const node of nodesToInsert) {
          // Always generate new UUID on backend to avoid conflicts
          const id = uuidv4();
          const status = node.strength >= 80 ? 'mastered' : 
                        node.strength >= 50 ? 'active' : 
                        node.strength >= 20 ? 'developing' : 'neglected';
          
          stmt.run(
            id,
            req.user!.id,
            node.label,
            node.type,
            node.strength || 50,
            status,
            node.description || null
          );
        }
      });
      
      insertMany(nodes);
    }
    
    // Get updated user
    const user = findUserById(req.user!.id);
    const createdNodes = db.prepare('SELECT * FROM nodes WHERE user_id = ?').all(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboarding_complete: Boolean(user.onboarding_complete),
        onboarding_method: user.onboarding_method
      },
      nodes: createdNodes
    });
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update node
app.patch('/api/nodes/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { strength, status, label, description } = req.body;
    
    // Verify ownership
    const existing = db.prepare('SELECT * FROM nodes WHERE id = ? AND user_id = ?')
      .get(id, req.user!.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (strength !== undefined) { updates.push('strength = ?'); values.push(strength); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (label !== undefined) { updates.push('label = ?'); values.push(label); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      db.prepare(`UPDATE nodes SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
    res.json({ node });
  } catch (error: any) {
    console.error('Update node error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete node
app.delete('/api/nodes/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = db.prepare('DELETE FROM nodes WHERE id = ? AND user_id = ?')
      .run(id, req.user!.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete node error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DAILY TRACKING
// ============================================

// Get tracking for date
app.get('/api/tracking/:date?', authMiddleware, (req: AuthRequest, res) => {
  try {
    const date = req.params.date || new Date().toISOString().split('T')[0];
    
    const tracking = db.prepare(`
      SELECT * FROM daily_tracking WHERE user_id = ? AND date = ?
    `).get(req.user!.id, date);
    
    res.json({ tracking: tracking || null, date });
  } catch (error: any) {
    console.error('Get tracking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save tracking
app.post('/api/tracking', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { date, calories, exercise_mins, deep_work_hrs, sleep_hrs, mood, notes } = req.body;
    const trackingDate = date || new Date().toISOString().split('T')[0];
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO daily_tracking (id, user_id, date, calories, exercise_mins, deep_work_hrs, sleep_hrs, mood, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        calories = excluded.calories,
        exercise_mins = excluded.exercise_mins,
        deep_work_hrs = excluded.deep_work_hrs,
        sleep_hrs = excluded.sleep_hrs,
        mood = excluded.mood,
        notes = excluded.notes
    `);
    
    stmt.run(id, req.user!.id, trackingDate, calories, exercise_mins, deep_work_hrs, sleep_hrs, mood, notes);
    
    const tracking = db.prepare(`
      SELECT * FROM daily_tracking WHERE user_id = ? AND date = ?
    `).get(req.user!.id, trackingDate);
    
    res.json({ tracking });
  } catch (error: any) {
    console.error('Save tracking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tracking history
app.get('/api/tracking/history/:days', authMiddleware, (req: AuthRequest, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    
    const history = db.prepare(`
      SELECT * FROM daily_tracking 
      WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
      ORDER BY date DESC
    `).all(req.user!.id, days);
    
    res.json({ history });
  } catch (error: any) {
    console.error('Get tracking history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DAILY ACTIONS
// ============================================

// Get or generate daily actions
app.get('/api/actions/:date?', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const date = req.params.date || new Date().toISOString().split('T')[0];
    
    // Check for existing actions
    let actions = db.prepare(`
      SELECT * FROM daily_actions WHERE user_id = ? AND date = ? ORDER BY created_at
    `).all(req.user!.id, date);
    
    // Generate new actions if none exist for today
    if (actions.length === 0 && date === new Date().toISOString().split('T')[0]) {
      const nodes = db.prepare('SELECT * FROM nodes WHERE user_id = ?').all(req.user!.id);
      
      if (nodes.length > 0) {
        const generated = await generateDailyActions(nodes);
        
        const insertAction = db.prepare(`
          INSERT INTO daily_actions (id, user_id, date, node_id, node_name, action_text, time_estimate)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        // Only insert up to 3 actions max
        const actionsToInsert = (generated.actions || []).slice(0, 3);
        
        for (const action of actionsToInsert) {
          insertAction.run(
            uuidv4(),
            req.user!.id,
            date,
            action.nodeId || null,
            action.nodeName,
            action.action,
            action.timeEstimate
          );
        }
        
        actions = db.prepare(`
          SELECT * FROM daily_actions WHERE user_id = ? AND date = ? ORDER BY created_at
        `).all(req.user!.id, date);
      }
    }
    
    res.json({ actions, date });
  } catch (error: any) {
    console.error('Get actions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update action status
app.patch('/api/actions/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, strength_change } = req.body;
    
    // Build update query dynamically based on what's provided
    let updateFields: string[] = [];
    let params: any[] = [];
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      params.push(status);
      
      if (status === 'done') {
        updateFields.push('completed_at = CURRENT_TIMESTAMP');
      } else if (status === 'pending') {
        updateFields.push('completed_at = NULL');
      }
    }
    
    if (strength_change !== undefined && strength_change !== null) {
      updateFields.push('strength_change = ?');
      params.push(strength_change);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(id, req.user!.id);
    
    const stmt = db.prepare(`
      UPDATE daily_actions 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(...params);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }
    
    const action = db.prepare('SELECT * FROM daily_actions WHERE id = ?').get(id);
    res.json({ action });
  } catch (error: any) {
    console.error('Update action error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Regenerate actions
app.post('/api/actions/regenerate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    
    // Delete ALL existing actions for today (not just pending)
    db.prepare(`
      DELETE FROM daily_actions WHERE user_id = ? AND date = ?
    `).run(req.user!.id, date);
    
    // Generate new ones
    const nodes = db.prepare('SELECT * FROM nodes WHERE user_id = ?').all(req.user!.id);
    const generated = await generateDailyActions(nodes);
    
    const insertAction = db.prepare(`
      INSERT INTO daily_actions (id, user_id, date, node_id, node_name, action_text, time_estimate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Only insert up to 3 actions max
    const actionsToInsert = (generated.actions || []).slice(0, 3);
    
    for (const action of actionsToInsert) {
      insertAction.run(
        uuidv4(),
        req.user!.id,
        date,
        action.nodeId || null,
        action.nodeName,
        action.action,
        action.timeEstimate
      );
    }
    
    const actions = db.prepare(`
      SELECT * FROM daily_actions WHERE user_id = ? AND date = ? ORDER BY created_at
    `).all(req.user!.id, date);
    
    res.json({ actions });
  } catch (error: any) {
    console.error('Regenerate actions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CHAT
// ============================================

// Main chat
app.post('/api/chat', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { message, history = [] } = req.body;
    
    const formattedHistory = history.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));
    
    // Get user info including onboarding method and AI mentor style
    const userInfo = db.prepare(`
      SELECT name, onboarding_method, created_at, ai_mentor_style
      FROM users
      WHERE id = ?
    `).get(req.user!.id) as any;
    
    // Get the user's selected AI mentor style (default to 'ruthless')
    const mentorStyle = userInfo?.ai_mentor_style || 'ruthless';

    // Get ALL user's identity nodes for comprehensive context
    const nodes = db.prepare(`
      SELECT label, type, strength, status, description, created_at
      FROM nodes
      WHERE user_id = ?
      ORDER BY strength DESC, created_at DESC
    `).all(req.user!.id) as any[];

    // Build comprehensive identity context string
    let identityContext = '';
    
    // Add user background
    if (userInfo) {
      identityContext += `USER PROFILE:\n`;
      identityContext += `Name: ${userInfo.name}\n`;
      if (userInfo.onboarding_method) {
        const methodDescriptions: Record<string, string> = {
          'questionnaire': 'User completed a structured questionnaire about their identity, goals, and patterns',
          'upload': 'User imported their identity data from external sources (chat history, documents, etc.)',
          'manual': 'User manually created their identity nodes'
        };
        identityContext += `Onboarding Method: ${methodDescriptions[userInfo.onboarding_method] || userInfo.onboarding_method}\n`;
        identityContext += `Account Created: ${new Date(userInfo.created_at).toLocaleDateString()}\n`;
      }
      identityContext += `\n`;
    }

    // Add comprehensive node information
    if (nodes.length > 0) {
      const nodesByType: Record<string, any[]> = {};
      nodes.forEach(node => {
        if (!nodesByType[node.type]) nodesByType[node.type] = [];
        nodesByType[node.type].push(node);
      });

      identityContext += `IDENTITY MAP (${nodes.length} total nodes):\n\n`;
      
      // Add nodes by type with full details
      Object.entries(nodesByType).forEach(([type, typeNodes]) => {
        identityContext += `${type.toUpperCase()} (${typeNodes.length}):\n`;
        typeNodes.forEach(node => {
          identityContext += `  • ${node.label}`;
          identityContext += ` (${node.strength}% strength, ${node.status})`;
          if (node.description && node.description.trim()) {
            identityContext += `\n    Description: ${node.description}`;
          }
          identityContext += `\n`;
        });
        identityContext += `\n`;
      });

      // Add summary insights
      const masteredCount = nodes.filter(n => n.status === 'mastered').length;
      const developingCount = nodes.filter(n => n.status === 'developing').length;
      const strugglesCount = nodes.filter(n => n.type === 'struggle').length;
      const goalsCount = nodes.filter(n => n.type === 'goal').length;
      const avgStrength = nodes.length > 0 
        ? Math.round(nodes.reduce((sum, n) => sum + n.strength, 0) / nodes.length)
        : 50;
      
      identityContext += `KEY INSIGHTS:\n`;
      identityContext += `- ${masteredCount} mastered patterns (strengths)\n`;
      identityContext += `- ${developingCount} developing areas (growth edges)\n`;
      identityContext += `- ${goalsCount} active goals\n`;
      identityContext += `- ${strugglesCount} identified struggles\n`;
      identityContext += `- Average strength: ${avgStrength}% (${avgStrength >= 60 ? 'strong overall' : avgStrength >= 40 ? 'moderate' : 'needs support'})\n`;
      identityContext += `\n`;
      
      // Add tone indicators for AI
      identityContext += `TONE GUIDANCE FOR AI:\n`;
      if (strugglesCount > goalsCount) {
        identityContext += `- User has more struggles than goals: Be more supportive and empathetic while still being direct.\n`;
      }
      if (masteredCount > developingCount) {
        identityContext += `- User has strong mastered patterns: You can challenge them more and push for higher growth.\n`;
      }
      if (userInfo.onboarding_method === 'upload') {
        identityContext += `- User imported deep personal data: Reference specific insights, patterns, or themes from their imported content. Show you've absorbed their complete history.\n`;
      }
      if (developingCount > masteredCount) {
        identityContext += `- User is in active growth phase: Focus on their developing areas and provide actionable guidance.\n`;
      }
      identityContext += `\n`;
      
      // Add top patterns by strength
      const topPatterns = nodes.slice(0, 5);
      if (topPatterns.length > 0) {
        identityContext += `STRONGEST IDENTITY PATTERNS:\n`;
        topPatterns.forEach(node => {
          identityContext += `- ${node.label} (${node.strength}%)\n`;
        });
        identityContext += `\n`;
      }
      
      // Add active struggles for tone context
      const activeStruggles = nodes.filter(n => n.type === 'struggle' && n.status !== 'mastered').slice(0, 3);
      if (activeStruggles.length > 0) {
        identityContext += `ACTIVE STRUGGLES (be aware of these in your responses):\n`;
        activeStruggles.forEach(node => {
          identityContext += `- ${node.label} (${node.strength}%, ${node.status})\n`;
        });
        identityContext += `\n`;
      }
    } else {
      identityContext += `No identity nodes have been created yet. User is new to the platform.\n`;
    }
    
    const response = await chat(message, formattedHistory, undefined, identityContext, mentorStyle);
    
    // Save messages
    const saveMsg = db.prepare(`
      INSERT INTO chat_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)
    `);
    saveMsg.run(uuidv4(), req.user!.id, 'user', message);
    saveMsg.run(uuidv4(), req.user!.id, 'assistant', response);

    res.json({ response });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Work session chat
app.post('/api/chat/work-session', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { message, nodeName, history = [] } = req.body;
    
    const formattedHistory = history.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    // Get the specific node being worked on for context
    const node = db.prepare(`
      SELECT label, type, strength, status, description
      FROM nodes
      WHERE user_id = ? AND label = ?
      LIMIT 1
    `).get(req.user!.id, nodeName) as any;

    let identityContext = '';
    if (node) {
      identityContext = `Current Focus Node:\n- ${node.label} (${node.type}, ${node.strength}% strength, ${node.status})\n${node.description ? `- Description: ${node.description}\n` : ''}`;
    }

    const contextPrompt = `The user is working on: "${nodeName}"\n\n${SYSTEM_PROMPTS.workSession}`;
    const response = await chat(message, formattedHistory, contextPrompt, identityContext);

    res.json({ response });
  } catch (error: any) {
    console.error('Work session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WORK SESSION MESSAGE HISTORY
// ============================================

// Get work session message history for a specific node
app.get('/api/work-session/messages/:nodeId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50; // Last 50 messages by default
    
    const messages = db.prepare(`
      SELECT id, role, content, created_at
      FROM work_session_messages
      WHERE user_id = ? AND node_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(req.user!.id, nodeId, limit) as any[];
    
    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();
    
    res.json({ 
      messages: chronologicalMessages,
      nodeId,
      count: chronologicalMessages.length
    });
  } catch (error: any) {
    console.error('Get work session messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save a work session message
app.post('/api/work-session/messages', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { nodeId, role, content } = req.body;
    
    if (!nodeId || !role || !content) {
      return res.status(400).json({ error: 'nodeId, role, and content are required' });
    }
    
    if (!['user', 'assistant'].includes(role)) {
      return res.status(400).json({ error: 'role must be "user" or "assistant"' });
    }
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO work_session_messages (id, user_id, node_id, role, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user!.id, nodeId, role, content);
    
    res.json({ 
      success: true,
      message: { id, nodeId, role, content, created_at: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('Save work session message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear work session history for a node (optional, for reset)
app.delete('/api/work-session/messages/:nodeId', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;
    
    const result = db.prepare(`
      DELETE FROM work_session_messages
      WHERE user_id = ? AND node_id = ?
    `).run(req.user!.id, nodeId);
    
    res.json({ 
      success: true,
      deleted: result.changes
    });
  } catch (error: any) {
    console.error('Clear work session messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SUMMARIES & ANALYTICS
// ============================================

// Get or generate daily summary
app.get('/api/summary/:date?', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const date = req.params.date || new Date().toISOString().split('T')[0];
    
    // Check for existing summary
    let summary = db.prepare(`
      SELECT * FROM daily_summaries WHERE user_id = ? AND date = ?
    `).get(req.user!.id, date) as any;
    
    if (summary) {
      return res.json({ summary: { ...summary, insights: JSON.parse(summary.insights || '{}') } });
    }
    
    // Generate new summary
    const tracking = db.prepare(`
      SELECT * FROM daily_tracking WHERE user_id = ? AND date = ?
    `).get(req.user!.id, date);
    
    const actions = db.prepare(`
      SELECT * FROM daily_actions WHERE user_id = ? AND date = ?
    `).all(req.user!.id, date);
    
    const nodes = db.prepare('SELECT * FROM nodes WHERE user_id = ?').all(req.user!.id);
    
    const generated = await generateSummary(tracking || {}, actions, nodes);
    
    // Save summary
    const id = uuidv4();
    db.prepare(`
      INSERT INTO daily_summaries (id, user_id, date, summary, alignment_score, insights)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user!.id,
      date,
      generated.headline,
      generated.alignmentScore,
      JSON.stringify(generated)
    );
    
    res.json({ summary: { ...generated, date } });
  } catch (error: any) {
    console.error('Summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analytics/stats
app.get('/api/analytics', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Node stats
    const nodeStats = db.prepare(`
      SELECT 
        type,
        COUNT(*) as count,
        AVG(strength) as avgStrength,
        SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) as mastered
      FROM nodes WHERE user_id = ?
      GROUP BY type
    `).all(userId);
    
    // Tracking streak
    const trackingDays = db.prepare(`
      SELECT COUNT(DISTINCT date) as days FROM daily_tracking WHERE user_id = ?
    `).get(userId) as any;
    
    // Action completion rate
    const actionStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
      FROM daily_actions WHERE user_id = ?
    `).get(userId) as any;
    
    // Recent alignment scores
    const recentScores = db.prepare(`
      SELECT date, alignment_score FROM daily_summaries 
      WHERE user_id = ? ORDER BY date DESC LIMIT 7
    `).all(userId);
    
    res.json({
      nodeStats,
      trackingDays: trackingDays?.days || 0,
      actionCompletionRate: actionStats?.total > 0 
        ? Math.round((actionStats.completed / actionStats.total) * 100) 
        : 0,
      recentAlignmentScores: recentScores
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROFILE & SETTINGS
// ============================================

// Get user profile with stats
app.get('/api/profile', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const user = db.prepare(`
      SELECT id, email, name, created_at, onboarding_complete, onboarding_method,
             email_verified, experiment_start_date, current_streak, longest_streak, last_active_date
      FROM users WHERE id = ?
    `).get(userId) as any;
    
    const nodeCount = db.prepare('SELECT COUNT(*) as count FROM nodes WHERE user_id = ?').get(userId) as any;
    const trackingDays = db.prepare('SELECT COUNT(DISTINCT date) as days FROM daily_tracking WHERE user_id = ?').get(userId) as any;
    const actionsCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM daily_actions WHERE user_id = ? AND status = 'done'
    `).get(userId) as any;
    const workSessions = db.prepare('SELECT COUNT(*) as count FROM work_sessions WHERE user_id = ?').get(userId) as any;
    
    res.json({
      user,
      stats: {
        nodesCreated: nodeCount?.count || 0,
        trackingDays: trackingDays?.days || 0,
        actionsCompleted: actionsCompleted?.count || 0,
        workSessions: workSessions?.count || 0
      }
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update profile
app.patch('/api/profile', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;
    
    if (name) {
      if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
      }
      db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, userId);
    }
    
    const user = db.prepare('SELECT id, email, name, onboarding_complete FROM users WHERE id = ?').get(userId);
    res.json({ user });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change password
app.post('/api/profile/change-password', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    const user = findUserById(userId, true);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!user.password_hash) {
      return res.status(500).json({ error: 'Failed to verify password' });
    }
    
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(passwordHash, userId);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Update AI mentor style
app.patch('/api/profile/mentor-style', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { mentorStyle } = req.body;
    const userId = req.user!.id;
    
    const validStyles: AIMentorStyle[] = ['ruthless', 'architect', 'mirror', 'coach'];
    if (!mentorStyle || !validStyles.includes(mentorStyle)) {
      return res.status(400).json({ 
        error: 'Invalid mentor style. Must be one of: ruthless, architect, mirror, coach' 
      });
    }
    
    db.prepare('UPDATE users SET ai_mentor_style = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(mentorStyle, userId);
    
    console.log(`Updated mentor style for user ${req.user!.email} to: ${mentorStyle}`);
    
    res.json({ 
      message: 'Mentor style updated successfully',
      mentorStyle 
    });
  } catch (error: any) {
    console.error('Update mentor style error:', error);
    res.status(500).json({ error: 'Failed to update mentor style' });
  }
});

// Get current mentor style
app.get('/api/profile/mentor-style', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const user = db.prepare('SELECT ai_mentor_style FROM users WHERE id = ?').get(userId) as any;
    
    res.json({ 
      mentorStyle: user?.ai_mentor_style || 'ruthless',
      availableStyles: [
        { id: 'ruthless', name: 'Ruthless Mentor', description: 'High-pressure, uncompromising truth' },
        { id: 'architect', name: 'Strategic Architect', description: 'System-building, logical frameworks' },
        { id: 'mirror', name: 'Psychological Mirror', description: 'Self-awareness, pattern reflection' },
        { id: 'coach', name: 'Supportive Coach', description: 'Encouraging but honest growth partner' }
      ]
    });
  } catch (error: any) {
    console.error('Get mentor style error:', error);
    res.status(500).json({ error: 'Failed to get mentor style' });
  }
});

// ============================================
// 30-DAY EXPERIMENT TRACKER
// ============================================

// Start the 30-day experiment
app.post('/api/experiment/start', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already started
    const user = db.prepare('SELECT experiment_start_date FROM users WHERE id = ?').get(userId) as any;
    
    if (user?.experiment_start_date) {
      return res.status(400).json({ error: 'Experiment already started', startDate: user.experiment_start_date });
    }
    
    db.prepare(`
      UPDATE users SET experiment_start_date = ?, current_streak = 0, last_active_date = ?
      WHERE id = ?
    `).run(today, today, userId);
    
    // Add milestone
    db.prepare(`
      INSERT INTO milestones (id, user_id, type, metadata)
      VALUES (?, ?, 'experiment_started', ?)
    `).run(uuidv4(), userId, JSON.stringify({ date: today }));
    
    res.json({ 
      message: 'Experiment started!', 
      startDate: today,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  } catch (error: any) {
    console.error('Start experiment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get experiment progress
app.get('/api/experiment', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const user = db.prepare(`
      SELECT experiment_start_date, current_streak, longest_streak, last_active_date
      FROM users WHERE id = ?
    `).get(userId) as any;
    
    if (!user?.experiment_start_date) {
      return res.json({ 
        started: false, 
        message: 'Start your 30-day identity engineering experiment!' 
      });
    }
    
    const startDate = new Date(user.experiment_start_date);
    const today = new Date();
    const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(0, 30 - dayNumber);
    const isCompleted = dayNumber > 30;
    
    // Get daily activity for calendar view
    // Simplified query that gets all dates and counts
    const activities: Array<{ date: string; actions_done: number; actions_total: number; tracked: number }> = [];
    
    // Get all dates from actions
    const actionDates = db.prepare(`
      SELECT DISTINCT date FROM daily_actions 
      WHERE user_id = ? AND date >= ?
      ORDER BY date
    `).all(userId, user.experiment_start_date) as Array<{ date: string }>;
    
    // Get all dates from tracking
    const trackingDates = db.prepare(`
      SELECT DISTINCT date FROM daily_tracking 
      WHERE user_id = ? AND date >= ?
      ORDER BY date
    `).all(userId, user.experiment_start_date) as Array<{ date: string }>;
    
    // Combine all unique dates
    const allDates = new Set<string>();
    actionDates.forEach(row => allDates.add(row.date));
    trackingDates.forEach(row => allDates.add(row.date));
    
    // Count actions and tracking for each date
    for (const date of Array.from(allDates).sort()) {
      const actionsDone = db.prepare(`
        SELECT COUNT(*) as count FROM daily_actions 
        WHERE user_id = ? AND date = ? AND status = 'done'
      `).get(userId, date) as { count: number } | undefined;
      
      const totalActions = db.prepare(`
        SELECT COUNT(*) as count FROM daily_actions 
        WHERE user_id = ? AND date = ?
      `).get(userId, date) as { count: number } | undefined;
      
      const tracked = db.prepare(`
        SELECT COUNT(*) as count FROM daily_tracking 
        WHERE user_id = ? AND date = ?
      `).get(userId, date) as { count: number } | undefined;
      
      activities.push({
        date,
        actions_done: actionsDone?.count || 0,
        actions_total: totalActions?.count || 0,
        tracked: tracked?.count || 0
      });
    }
    
    // Get milestones achieved
    const milestones = db.prepare(`
      SELECT type, achieved_at, metadata FROM milestones 
      WHERE user_id = ? ORDER BY achieved_at
    `).all(userId);
    
    res.json({
      started: true,
      startDate: user.experiment_start_date,
      endDate: endDate.toISOString().split('T')[0],
      dayNumber: Math.min(dayNumber, 31),
      daysRemaining,
      isCompleted,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      lastActiveDate: user.last_active_date,
      activities,
      milestones,
      progress: Math.min(100, Math.round((dayNumber / 30) * 100))
    });
  } catch (error: any) {
    console.error('Get experiment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check in for today (called when user completes actions or tracking)
app.post('/api/experiment/checkin', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split('T')[0];
    
    const user = db.prepare(`
      SELECT experiment_start_date, current_streak, longest_streak, last_active_date
      FROM users WHERE id = ?
    `).get(userId) as any;
    
    if (!user?.experiment_start_date) {
      return res.status(400).json({ error: 'Experiment not started' });
    }
    
    // Calculate streak
    let newStreak = 1;
    if (user.last_active_date) {
      const lastActive = new Date(user.last_active_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Already checked in today
        return res.json({ 
          streak: user.current_streak, 
          longestStreak: user.longest_streak,
          message: 'Already checked in today' 
        });
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = user.current_streak + 1;
      }
      // else streak resets to 1
    }
    
    const newLongest = Math.max(user.longest_streak, newStreak);
    
    db.prepare(`
      UPDATE users SET current_streak = ?, longest_streak = ?, last_active_date = ?
      WHERE id = ?
    `).run(newStreak, newLongest, today, userId);
    
    // Check for streak milestones
    const streakMilestones = [7, 14, 21, 30];
    if (streakMilestones.includes(newStreak)) {
      db.prepare(`
        INSERT INTO milestones (id, user_id, type, metadata)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), userId, `streak_${newStreak}`, JSON.stringify({ date: today, streak: newStreak }));
    }
    
    // Check for experiment day milestones
    const startDate = new Date(user.experiment_start_date);
    const dayNumber = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dayMilestones = [7, 14, 21, 30];
    
    if (dayMilestones.includes(dayNumber)) {
      const existingMilestone = db.prepare(`
        SELECT id FROM milestones WHERE user_id = ? AND type = ?
      `).get(userId, `day_${dayNumber}`);
      
      if (!existingMilestone) {
        db.prepare(`
          INSERT INTO milestones (id, user_id, type, metadata)
          VALUES (?, ?, ?, ?)
        `).run(uuidv4(), userId, `day_${dayNumber}`, JSON.stringify({ date: today }));
      }
    }
    
    res.json({ 
      streak: newStreak, 
      longestStreak: newLongest,
      dayNumber,
      message: newStreak > 1 ? `🔥 ${newStreak} day streak!` : 'Great start!'
    });
  } catch (error: any) {
    console.error('Checkin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

// Listen on all interfaces (0.0.0.0) not just localhost for Docker/Fly.io
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🧬 ═══════════════════════════════════════════════════════════
   EVOS API - The World's First Identity Engineering Platform
   ═══════════════════════════════════════════════════════════
   
   Server running on: http://0.0.0.0:${PORT}
   AI Mode: ${isAIAvailable() ? '🟢 OpenAI Connected' : '🟡 Mock Mode (no API key)'}
   Database: SQLite (evos.db)
   
   Endpoints:
   • POST /api/auth/register    - Create account
   • POST /api/auth/login       - Login
   • POST /api/auth/demo        - Demo login
   • GET  /api/nodes            - Get identity nodes
   • POST /api/tracking         - Save daily tracking
   • GET  /api/actions          - Get daily actions
   • POST /api/chat             - Chat with Evos AI
   • GET  /api/summary          - Get daily summary
   • GET  /api/analytics        - Get analytics

🧬 ═══════════════════════════════════════════════════════════
  `);
});
