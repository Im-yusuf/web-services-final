// Integration tests for saved listings CRUD endpoints.
// Creates a test user in beforeAll to obtain an auth token for protected routes.
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';

describe('Saved Listings Endpoints', () => {
  let authToken: string;
  let testPropertyId: string;

  const testUser = {
    email: `saved-test-${Date.now()}@example.com`,
    password: 'SecurePass123!',
  };

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    authToken = res.body.data.token;

    const property = await prisma.propertySale.create({
      data: {
        transactionId: `test-transaction-${Date.now()}`,
        price: 250000,
        transferDate: new Date('2025-01-01T00:00:00.000Z'),
        postcode: 'LS1 1AA',
        propertyType: 'T',
        newBuild: false,
        tenure: 'F',
        street: 'TEST STREET',
        townCity: 'LEEDS',
        district: 'LEEDS',
        county: 'WEST YORKSHIRE',
      },
    });

    testPropertyId = property.id;
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

    it('should return 409 when saving the same property twice', async () => {
      const firstSave = await request(app)
        .post('/api/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ propertyId: testPropertyId })
        .expect(201);

      expect(firstSave.body.success).toBe(true);

      const duplicateSave = await request(app)
        .post('/api/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ propertyId: testPropertyId })
        .expect(409);

      expect(duplicateSave.body.success).toBe(false);
      expect(duplicateSave.body.error).toBe('Property already saved');
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

  describe('PUT /api/saved/:id', () => {
    it('should reject without auth', async () => {
      await request(app)
        .put('/api/saved/some-id')
        .send({ notes: 'updated' })
        .expect(401);
    });

    it('should return 404 for non-existent listing', async () => {
      const res = await request(app)
        .put('/api/saved/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'updated' })
        .expect(404);

      expect(res.body.success).toBe(false);
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
