const request = require('supertest');
const app = require('../../src/app');
const { cleanDatabase, createTestUser, generateTestToken } = require('../utils/database');

describe('Authentication Routes', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur avec des données valides', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+33123456789'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur créé avec succès. Veuillez vérifier votre email.');
      expect(response.body.data.user).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'customer'
      });
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('devrait rejeter un email déjà existant', async () => {
      // Créer un utilisateur
      await createTestUser();

      // Essayer de créer un utilisateur avec le même email
      const response = await request(app)
        .post('/api/auth/register')
        .send(global.testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Un utilisateur avec cet email existe déjà');
    });

    it('devrait rejeter des données invalides', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Trop court
        firstName: '',
        lastName: ''
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: global.testUser.email,
          password: global.testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body.data.user).toMatchObject({
        email: global.testUser.email,
        firstName: global.testUser.firstName,
        lastName: global.testUser.lastName
      });
      expect(response.body.data.token).toBeDefined();
    });

    it('devrait rejeter des identifiants invalides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: global.testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });

    it('devrait rejeter un email inexistant', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });
  });

  describe('GET /api/auth/me', () => {
    let user, token;

    beforeEach(async () => {
      user = await createTestUser();
      token = generateTestToken(user.id);
    });

    it('devrait retourner les informations de l\'utilisateur connecté', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        id: user.id,
        email: user.email
      });
      // Vérifier que les champs first_name et last_name existent (noms de la DB)
      expect(response.body.data.user.first_name).toBeDefined();
      expect(response.body.data.user.last_name).toBeDefined();
    });

    it('devrait rejeter une requête sans token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter un token invalide', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
