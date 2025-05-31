// Configuration globale pour les tests
require('dotenv').config({ path: '.env.test' });

// Variables d'environnement spécifiques aux tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Configuration des timeouts
jest.setTimeout(10000);

// Mock des services externes pour les tests (seulement s'ils existent)
const fs = require('fs');
const path = require('path');

// Mock email seulement si le module existe
const emailPath = path.join(__dirname, '../src/utils/email.js');
if (fs.existsSync(emailPath)) {
  jest.mock('../src/utils/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
  }));
}

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://test-cloudinary-url.com/test-image.jpg',
        public_id: 'test-public-id'
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Variables globales pour les tests
global.testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+33123456789'
};

global.testAdmin = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
};

global.testDrone = {
  name: 'Drone Test DX-1000',
  brand: 'TestBrand',
  model: 'DX-1000',
  price: 1299.99,
  description: 'Drone de test pour les tests unitaires',
  specifications: {
    weight: 2.5,
    batteryLife: 30,
    maxSpeed: 50,
    maxRange: 10000
  },
  features: ['GPS', 'Caméra 4K', 'Stabilisateur'],
  stockQuantity: 10
};
