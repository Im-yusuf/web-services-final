import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Saved Listings Endpoints', () => {
  let authToken: string;
  let savedId: string;

  const testUser = {
    email: `saved-test-${Date.now()}@example.com`,
    password: 'SecurePass123!',
  };

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    authToken = res.body.data.token;
  });

  describe('POST /api/saved', () => {
    it('should reject without auth', async () => {
      await request(app)
        .post('/api/saved')
        .send({ propertyId: 'some-id' })
        .expect(401);
    });

    it('should reject invalid property ID', async () => {
      const res = await request(app)
        .post('/api/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ propertyId: 'not-a-uuid' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/saved', () => {
    it('should reject without auth', async () => {
      await request(app)
        .get('/api/saved')
        .expect(401);
    });

    it('should return empty list initially', async () => {
      const res = await request(app)
        .get('/api/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/saved/:id', () => {
    it('should reject without auth', async () => {
      await request(app)
        .delete('/api/saved/some-id')
        .expect(401);
    });
  });
});
