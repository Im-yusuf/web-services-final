// Controller for authentication endpoints (register, login, logout, me).
// Delegates to AuthService for business logic and maps service-layer
// errors to appropriate HTTP status codes.
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  // POST /api/auth/register — create a new user account and return a session token
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.register({ email, password });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const status = message === 'Email already registered' ? 409 : 500;
      res.status(status).json({ success: false, error: message });
    }
  }

  // POST /api/auth/login — authenticate with email + password
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ success: false, error: message });
    }
  }

  // POST /api/auth/logout — invalidate the current session token
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        await AuthService.logout(token);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to logout' });
    }
  }

  // GET /api/auth/me — return the authenticated user’s info
  static async me(req: Request, res: Response): Promise<void> {
    try {
      res.json({ success: true, data: { user: req.user } });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to get user info' });
    }
  }
}
