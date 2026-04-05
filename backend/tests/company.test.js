// backend/tests/company.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

let coordinatorToken, studentToken, companyId;

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_tracker_test';
  if (mongoose.connection.readyState === 0) await mongoose.connect(uri);

  // Register coordinator
  const coordRes = await request(app).post('/api/auth/register').send({
    name: 'Test Coordinator', email: 'coord@test.com',
    password: 'password123', role: 'coordinator',
    coordinatorProfile: { employeeId: 'C001', department: 'Placement' },
  });
  coordinatorToken = coordRes.body.token;

  // Register student
  const stuRes = await request(app).post('/api/auth/register').send({
    name: 'Test Student', email: 'stu@test.com',
    password: 'password123', role: 'student',
    studentProfile: { branch: 'CSE', year: 4, cgpa: 8.0, backlogs: 0 },
  });
  studentToken = stuRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Company Routes', () => {
  const companyPayload = {
    name: 'Test Corp',
    industry: 'IT',
    hiringStatus: 'open',
    roles: [{
      title: 'SWE', type: 'Full-Time', package: 10, openings: 5,
      eligibility: { branches: ['CSE', 'IT'], minCGPA: 6.0, maxBacklogs: 0 },
    }],
  };

  it('coordinator can create a company', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send(companyPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Corp');
    companyId = res.body.data._id;
  });

  it('student cannot create a company', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(companyPayload);
    expect(res.status).toBe(403);
  });

  it('anyone authenticated can list companies', async () => {
    const res = await request(app)
      .get('/api/companies')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('can get company by id', async () => {
    const res = await request(app)
      .get(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Corp');
  });

  it('coordinator can update company status', async () => {
    const res = await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({ hiringStatus: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.hiringStatus).toBe('in_progress');
  });
});

describe('Application Routes', () => {
  it('student can apply to open company', async () => {
    // Reopen company first
    await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({ hiringStatus: 'open' });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ companyId, roleTitle: 'SWE' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('applied');
  });

  it('student cannot apply twice to same company', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ companyId, roleTitle: 'SWE' });
    expect(res.status).toBe(409);
  });

  it('student can view their applications', async () => {
    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('coordinator can view all applications', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${coordinatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('Dashboard Routes', () => {
  it('student dashboard returns correct shape', async () => {
    const res = await request(app)
      .get('/api/dashboard/student')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('applicationStats');
    expect(res.body.data).toHaveProperty('openCompanies');
  });

  it('coordinator dashboard returns analytics', async () => {
    const res = await request(app)
      .get('/api/dashboard/coordinator')
      .set('Authorization', `Bearer ${coordinatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('overview');
    expect(res.body.data.overview).toHaveProperty('totalStudents');
    expect(res.body.data.overview).toHaveProperty('placementRate');
  });
});
