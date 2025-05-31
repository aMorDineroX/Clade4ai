const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Configuration de la connexion à la base de données Neon
const sql = neon(process.env.DATABASE_URL);

// Test de connexion
const testConnection = async () => {
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Connexion à la base de données réussie');
    console.log('📊 Version PostgreSQL:', result[0].version);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
};

// Fonction utilitaire pour exécuter des requêtes avec gestion d'erreur
const query = async (queryText, params = []) => {
  try {
    const result = await sql(queryText, ...params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Erreur SQL:', error.message);
    return { success: false, error: error.message };
  }
};

// Fonction pour créer les tables si elles n'existent pas
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initialisation de la base de données...');

    // Création des tables dans l'ordre correct (en respectant les clés étrangères)
    await createTables();

    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    throw error;
  }
};

const createTables = async () => {
  // Table des utilisateurs
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      is_verified BOOLEAN DEFAULT false,
      verification_token VARCHAR(255),
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Table des catégories
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Table des drones
  await sql`
    CREATE TABLE IF NOT EXISTS drones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      brand VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      images JSONB DEFAULT '[]',
      specifications JSONB DEFAULT '{}',
      features JSONB DEFAULT '[]',
      stock_quantity INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      weight DECIMAL(5,2),
      dimensions JSONB DEFAULT '{}',
      battery_life INTEGER,
      max_speed INTEGER,
      max_range INTEGER,
      camera_specs JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Table des commandes
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'paypal')),
      payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      shipping_address JSONB NOT NULL,
      items JSONB NOT NULL,
      tracking_number VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Table des avis
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      drone_id UUID REFERENCES drones(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(100) NOT NULL,
      comment TEXT NOT NULL,
      is_approved BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, drone_id)
    )
  `;

  // Index pour améliorer les performances
  await sql`CREATE INDEX IF NOT EXISTS idx_drones_category ON drones(category_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_drones_brand ON drones(brand)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_drones_price ON drones(price)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_drone ON reviews(drone_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)`;

  console.log('📋 Tables et index créés avec succès');
};

module.exports = {
  sql,
  query,
  testConnection,
  initializeDatabase
};
