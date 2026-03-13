import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { RegisterInput, LoginInput } from '../types';

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 7;

export class AuthService {
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

  static async logout(token: string) {
    await prisma.session.deleteMany({ where: { token } });
  }

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
