const request = require('supertest');
const app = require('../../src/app');
const { 
  cleanDatabase, 
  createTestUser, 
  createTestCategory, 
  createTestDrone, 
  generateTestToken 
} = require('../utils/database');

describe('Drones Routes', () => {
  let user, admin, token, adminToken, category, drone;

  beforeEach(async () => {
    await cleanDatabase();
    
    // Créer utilisateur et admin
    user = await createTestUser();
    admin = await createTestUser(global.testAdmin);
    
    token = generateTestToken(user.id);
    adminToken = generateTestToken(admin.id);
    
    // Créer catégorie et drone
    category = await createTestCategory();
    drone = await createTestDrone(global.testDrone, category.id);
  });

  describe('GET /api/drones', () => {
    it('devrait retourner la liste des drones avec pagination', async () => {
      const response = await request(app)
        .get('/api/drones')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drones).toBeInstanceOf(Array);
      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.pagination).toMatchObject({
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 1,
        totalPages: 1
      });
    });

    it('devrait filtrer les drones par recherche', async () => {
      const response = await request(app)
        .get('/api/drones?search=DX-1000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drones).toHaveLength(1);
      expect(response.body.data.drones[0].model).toBe('DX-1000');
    });

    it('devrait filtrer les drones par prix', async () => {
      const response = await request(app)
        .get('/api/drones?minPrice=1000&maxPrice=1500')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drones).toHaveLength(1);
    });

    it('devrait retourner une liste vide pour des filtres restrictifs', async () => {
      const response = await request(app)
        .get('/api/drones?minPrice=5000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drones).toHaveLength(0);
    });
  });

  describe('GET /api/drones/:id', () => {
    it('devrait retourner un drone spécifique', async () => {
      const response = await request(app)
        .get(`/api/drones/${drone.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.drone).toMatchObject({
        id: drone.id,
        name: drone.name,
        brand: drone.brand,
        model: drone.model,
        price: parseFloat(drone.price)
      });
    });

    it('devrait retourner 404 pour un drone inexistant', async () => {
      const response = await request(app)
        .get('/api/drones/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Drone non trouvé');
    });
  });

  describe('POST /api/drones (Admin only)', () => {
    const newDroneData = {
      name: 'Nouveau Drone Test',
      brand: 'TestBrand',
      model: 'NT-2000',
      price: 1599.99,
      description: 'Nouveau drone pour les tests',
      specifications: {
        weight: 3.0,
        batteryLife: 45,
        maxSpeed: 60,
        maxRange: 15000
      },
      features: ['GPS', 'Caméra 4K', 'Return Home'],
      stockQuantity: 5
    };

    it('devrait permettre à un admin de créer un drone', async () => {
      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...newDroneData, categoryId: category.id })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drone créé avec succès');
      expect(response.body.data.drone).toMatchObject({
        name: newDroneData.name,
        brand: newDroneData.brand,
        model: newDroneData.model,
        price: newDroneData.price
      });
    });

    it('devrait rejeter la création par un utilisateur normal', async () => {
      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...newDroneData, categoryId: category.id })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter des données invalides', async () => {
      const invalidData = {
        name: '', // Nom vide
        price: -100 // Prix négatif
      };

      const response = await request(app)
        .post('/api/drones')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/drones/:id (Admin only)', () => {
    const updateData = {
      name: 'Drone Mis à Jour',
      price: 1399.99
    };

    it('devrait permettre à un admin de mettre à jour un drone', async () => {
      const response = await request(app)
        .put(`/api/drones/${drone.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drone mis à jour avec succès');
      expect(response.body.data.drone.name).toBe(updateData.name);
      expect(response.body.data.drone.price).toBe(updateData.price);
    });

    it('devrait rejeter la mise à jour par un utilisateur normal', async () => {
      const response = await request(app)
        .put(`/api/drones/${drone.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/drones/:id (Admin only)', () => {
    it('devrait permettre à un admin de supprimer un drone', async () => {
      const response = await request(app)
        .delete(`/api/drones/${drone.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Drone supprimé avec succès');
    });

    it('devrait rejeter la suppression par un utilisateur normal', async () => {
      const response = await request(app)
        .delete(`/api/drones/${drone.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
