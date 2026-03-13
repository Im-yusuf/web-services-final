// Authentication service — handles user registration, login, logout,
// and session token lifecycle. Passwords are hashed with bcrypt;
// sessions use cryptographically random tokens stored in the database.
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { RegisterInput, LoginInput } from '../types';

// bcrypt cost factor — higher = more secure but slower
const SALT_ROUNDS = 12;
// How long a session token stays valid before requiring re-authentication
const SESSION_EXPIRY_DAYS = 7;

export class AuthService {
  // Register a new user — hashes password, creates user row, issues session
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
      },
      select: { id: true, email: true, createdAt: true },
    });

    const token = await AuthService.createSession(user.id);

    return { user, token };
  }

  // Authenticate an existing user — verifies password hash, issues session
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = await AuthService.createSession(user.id);

    return {
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token,
    };
  }

  // Invalidate a session by deleting its token from the database
  static async logout(token: string) {
    await prisma.session.deleteMany({ where: { token } });
  }

  // Generate a cryptographically random session token and persist it
  private static async createSession(userId: string): Promise<string> {
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await prisma.session.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }
}
