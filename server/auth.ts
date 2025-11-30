import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'evos-identity-engineering-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  onboarding_complete: boolean;
  onboarding_method?: string;
  email_verified?: boolean;
  password_hash?: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    return null;
  }
}

// Create user
export async function createUser(email: string, password: string, name: string): Promise<User> {
  const id = uuidv4();
  const passwordHash = await hashPassword(password);
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(id, email.toLowerCase(), passwordHash, name);
  
  return {
    id,
    email: email.toLowerCase(),
    name,
    created_at: new Date().toISOString(),
    onboarding_complete: false,
  };
}

// Find user by email
export function findUserByEmail(email: string): (User & { password_hash: string }) | null {
  const stmt = db.prepare(`
    SELECT id, email, password_hash, name, created_at, onboarding_complete, onboarding_method
    FROM users WHERE email = ?
  `);
  
  const row = stmt.get(email.toLowerCase()) as any;
  if (!row) return null;
  
  return {
    ...row,
    onboarding_complete: !!row.onboarding_complete,
  };
}

// Find user by ID
export function findUserById(id: string, includePassword: boolean = false): User | null {
  const fields = includePassword 
    ? 'id, email, password_hash, name, created_at, onboarding_complete, onboarding_method, email_verified'
    : 'id, email, name, created_at, onboarding_complete, onboarding_method, email_verified';
    
  const stmt = db.prepare(`
    SELECT ${fields}
    FROM users WHERE id = ?
  `);
  
  const row = stmt.get(id) as any;
  if (!row) return null;
  
  return {
    ...row,
    onboarding_complete: !!row.onboarding_complete,
    email_verified: !!row.email_verified,
  };
}

// Update user onboarding status
export function completeOnboarding(userId: string, method: string): void {
  const stmt = db.prepare(`
    UPDATE users SET onboarding_complete = 1, onboarding_method = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(method, userId);
}

// Auth middleware
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  
  const user = findUserById(decoded.id);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  
  req.user = user;
  next();
}

// Optional auth middleware (doesn't fail if no token)
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      const user = findUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  }
  
  next();
}


