const request = require('supertest');
const app = require('../src/app');
const { 
  cleanDatabase, 
  createTestUser, 
  generateTestToken 
} = require('./utils/database');

describe('Debug Admin Authentication', () => {
  let admin, adminToken;

  beforeEach(async () => {
    await cleanDatabase();
    
    console.log('🔍 Creating admin with data:', global.testAdmin);
    admin = await createTestUser(global.testAdmin);
    console.log('👤 Admin created in DB:', { id: admin.id, email: admin.email, role: admin.role });
    
    adminToken = generateTestToken(admin.id);
    console.log('🎫 Admin token generated for userId:', admin.id);
  });

  it('should verify admin token and role', async () => {
    // Test d'abord une route simple qui utilise authenticate
    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    console.log('✅ /api/auth/me response for admin:', {
      id: meResponse.body.data.user.id,
      email: meResponse.body.data.user.email,
      role: meResponse.body.data.user.role
    });

    // Maintenant test une route admin
    const adminResponse = await request(app)
      .get('/api/drones')
      .set('Authorization', `Bearer ${adminToken}`);

    console.log('📋 Admin can access drones list:', adminResponse.status);
  });
});
