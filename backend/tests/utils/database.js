const { sql } = require('../../src/config/database');

/**
 * Utilitaires pour les tests de base de données
 */

// Nettoyer toutes les tables de test
const cleanDatabase = async () => {
  try {
    await sql`TRUNCATE TABLE reviews RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE orders RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE drones RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE categories RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`;
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données:', error);
    throw error;
  }
};

// Créer un utilisateur de test
const createTestUser = async (userData = global.testUser) => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  
  const users = await sql`
    INSERT INTO users (email, password, first_name, last_name, phone, role, is_verified)
    VALUES (
      ${userData.email}, 
      ${hashedPassword}, 
      ${userData.firstName}, 
      ${userData.lastName}, 
      ${userData.phone || null}, 
      ${userData.role || 'customer'}, 
      true
    )
    RETURNING *
  `;
  
  return users[0];
};

// Créer une catégorie de test
const createTestCategory = async (categoryData = {}) => {
  const defaultCategory = {
    name: 'Drones de Test',
    slug: 'drones-test',
    description: 'Catégorie pour les tests',
    isActive: true
  };
  
  const category = { ...defaultCategory, ...categoryData };
  
  const categories = await sql`
    INSERT INTO categories (name, slug, description, is_active)
    VALUES (${category.name}, ${category.slug}, ${category.description}, ${category.isActive})
    RETURNING *
  `;
  
  return categories[0];
};

// Créer un drone de test
const createTestDrone = async (droneData = global.testDrone, categoryId = null) => {
  if (!categoryId) {
    const category = await createTestCategory();
    categoryId = category.id;
  }
  
  const slug = droneData.name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-');
  
  const drones = await sql`
    INSERT INTO drones (
      name, slug, brand, model, price, description, category_id,
      specifications, features, stock_quantity, is_active
    )
    VALUES (
      ${droneData.name},
      ${slug},
      ${droneData.brand},
      ${droneData.model},
      ${droneData.price},
      ${droneData.description},
      ${categoryId},
      ${JSON.stringify(droneData.specifications)},
      ${JSON.stringify(droneData.features)},
      ${droneData.stockQuantity},
      true
    )
    RETURNING *
  `;
  
  return drones[0];
};

// Générer un token JWT pour les tests
const generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Créer une commande de test
const createTestOrder = async (userId, droneId, orderData = {}) => {
  const defaultOrder = {
    totalAmount: 1299.99,
    status: 'pending',
    paymentMethod: 'card',
    paymentStatus: 'pending',
    shippingAddress: {
      street: '123 Test Street',
      city: 'Test City',
      postalCode: '12345',
      country: 'France'
    },
    items: [
      {
        droneId: droneId,
        quantity: 1,
        price: 1299.99
      }
    ]
  };
  
  const order = { ...defaultOrder, ...orderData };
  
  const orders = await sql`
    INSERT INTO orders (
      user_id, total_amount, status, payment_method, payment_status,
      shipping_address, items
    )
    VALUES (
      ${userId},
      ${order.totalAmount},
      ${order.status},
      ${order.paymentMethod},
      ${order.paymentStatus},
      ${JSON.stringify(order.shippingAddress)},
      ${JSON.stringify(order.items)}
    )
    RETURNING *
  `;
  
  return orders[0];
};

module.exports = {
  cleanDatabase,
  createTestUser,
  createTestCategory,
  createTestDrone,
  createTestOrder,
  generateTestToken
};
