// Integration tests for health check, Swagger docs, and market insights endpoints.
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Health & Docs', () => {
  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/docs should return swagger UI', async () => {
    const res = await request(app).get('/api/docs/').expect(200);
    expect(res.text).toContain('swagger');
  });

  it('GET /api/docs.json should return OpenAPI spec', async () => {
    const res = await request(app).get('/api/docs.json').expect(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toBe('EcoNest API');
  });
});

describe('Market Insights Endpoint', () => {
  it('POST /api/insights/region should require region', async () => {
    const res = await request(app)
      .post('/api/insights/region')
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('POST /api/insights/region should return structured insights', async () => {
    const res = await request(app)
      .post('/api/insights/region')
      .send({ region: 'LEEDS' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.region).toBe('LEEDS');
    expect(res.body.data.marketSignal).toBeDefined();
    expect(typeof res.body.data.totalTransactions).toBe('number');
  });
});
