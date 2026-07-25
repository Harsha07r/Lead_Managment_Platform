const request = require('supertest');
const { app } = require('../app');
const { connectTestDb, disconnectTestDb } = require('../config/testDb');

describe('Lead Management Platform API', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('logs in with the seeded admin user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@digitalheroesco.com', password: 'Password123!' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('admin');
  });

  it('creates a lead through the public lead endpoint', async () => {
    const res = await request(app)
      .post('/api/leads/public')
      .send({
        name: 'Ava Carter',
        email: 'ava@example.com',
        phone: '555-0101',
        company: 'Digital Heroes',
        source: 'Website',
        message: 'Interested in a demo.',
      })
      .expect(201);

    expect(res.body.lead).toHaveProperty('_id');
    expect(res.body.lead.status).toBe('New');
  });

  it('prevents a member from viewing other users', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@digitalheroesco.com', password: 'Password123!' })
      .expect(200);

    await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .expect(403);
  });
});
