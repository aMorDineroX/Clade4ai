require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql } = require('../config/database');

const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Début du seeding de la base de données...');

    // 1. Créer un utilisateur admin
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminUsers = await sql`
      INSERT INTO users (email, password, first_name, last_name, role, is_verified)
      VALUES ('admin@droneshop.com', ${adminPassword}, 'Admin', 'DroneShop', 'admin', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;

    if (adminUsers.length > 0) {
      console.log('✅ Utilisateur admin créé');
    }

    // 2. Créer des catégories
    const categories = [
      {
        name: 'Drones de loisir',
        description: 'Parfaits pour débuter et s\'amuser en famille',
        imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500'
      },
      {
        name: 'Drones professionnels',
        description: 'Pour la photographie et vidéographie professionnelle',
        imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500'
      },
      {
        name: 'Drones de course',
        description: 'Vitesse et agilité pour les compétitions FPV',
        imageUrl: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=500'
      }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const slug = createSlug(category.name);
      const result = await sql`
        INSERT INTO categories (name, slug, description, image_url)
        VALUES (${category.name}, ${slug}, ${category.description}, ${category.imageUrl})
        ON CONFLICT (slug) DO UPDATE SET
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url
        RETURNING id, name, slug
      `;
      createdCategories.push(result[0]);
    }

    console.log('✅ Catégories créées');

    // 3. Créer des drones
    const drones = [
      {
        name: 'DJI Mini 3 Pro',
        brand: 'DJI',
        model: 'Mini 3 Pro',
        price: 899.99,
        categorySlug: 'drones-professionnels',
        description: 'Drone compact avec caméra 4K et évitement d\'obstacles. Parfait pour la photographie aérienne professionnelle.',
        images: [
          'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800',
          'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800'
        ],
        specifications: {
          flightTime: 34,
          range: 12,
          maxSpeed: 57.6
        },
        features: ['Caméra 4K', 'Évitement d\'obstacles', 'Mode Follow Me', 'Transmission HD'],
        stockQuantity: 25,
        weight: 0.249,
        dimensions: { length: 145, width: 90, height: 62 },
        batteryLife: 34,
        maxSpeed: 57,
        maxRange: 12,
        cameraSpecs: {
          resolution: '4K',
          sensor: '1/1.3" CMOS',
          iso: '100-6400'
        }
      },
      {
        name: 'Parrot Anafi',
        brand: 'Parrot',
        model: 'Anafi',
        price: 599.99,
        categorySlug: 'drones-de-loisir',
        description: 'Drone léger et portable avec caméra 4K HDR. Idéal pour les débutants et les voyageurs.',
        images: [
          'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
          'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800'
        ],
        specifications: {
          flightTime: 25,
          range: 4,
          maxSpeed: 55
        },
        features: ['Caméra 4K HDR', 'Zoom 2.8x', 'Mode Dolly Zoom', 'Pliable'],
        stockQuantity: 15,
        weight: 0.320,
        dimensions: { length: 175, width: 240, height: 65 },
        batteryLife: 25,
        maxSpeed: 55,
        maxRange: 4,
        cameraSpecs: {
          resolution: '4K HDR',
          sensor: '1/2.4" CMOS',
          iso: '100-3200'
        }
      },
      {
        name: 'FPV Racing Drone X1',
        brand: 'SpeedDrone',
        model: 'X1 Racing',
        price: 299.99,
        categorySlug: 'drones-de-course',
        description: 'Drone de course haute performance pour les pilotes expérimentés. Vitesse et agilité maximales.',
        images: [
          'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800',
          'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800'
        ],
        specifications: {
          flightTime: 8,
          range: 2,
          maxSpeed: 120
        },
        features: ['FPV Racing', 'Châssis carbone', 'Moteurs brushless', 'Contrôleur de vol F4'],
        stockQuantity: 10,
        weight: 0.180,
        dimensions: { length: 130, width: 130, height: 30 },
        batteryLife: 8,
        maxSpeed: 120,
        maxRange: 2,
        cameraSpecs: {
          resolution: '1080p',
          sensor: 'CMOS',
          iso: '100-1600'
        }
      },
      {
        name: 'DJI Air 2S',
        brand: 'DJI',
        model: 'Air 2S',
        price: 1299.99,
        categorySlug: 'drones-professionnels',
        description: 'Drone professionnel avec capteur 1 pouce et vidéo 5.4K. Excellence en photographie aérienne.',
        images: [
          'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800',
          'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800'
        ],
        specifications: {
          flightTime: 31,
          range: 12,
          maxSpeed: 68.4
        },
        features: ['Capteur 1"', 'Vidéo 5.4K', 'MasterShots', 'ADS-B'],
        stockQuantity: 20,
        weight: 0.595,
        dimensions: { length: 183, width: 253, height: 77 },
        batteryLife: 31,
        maxSpeed: 68,
        maxRange: 12,
        cameraSpecs: {
          resolution: '5.4K',
          sensor: '1" CMOS',
          iso: '100-12800'
        }
      },
      {
        name: 'Beginner Drone Pro',
        brand: 'EasyFly',
        model: 'Pro Beginner',
        price: 199.99,
        categorySlug: 'drones-de-loisir',
        description: 'Drone parfait pour débuter avec toutes les fonctions de sécurité. Facile à piloter.',
        images: [
          'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800',
          'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800'
        ],
        specifications: {
          flightTime: 20,
          range: 1,
          maxSpeed: 25
        },
        features: ['Mode débutant', 'Retour automatique', 'Caméra HD', 'LED colorées'],
        stockQuantity: 30,
        weight: 0.150,
        dimensions: { length: 120, width: 120, height: 40 },
        batteryLife: 20,
        maxSpeed: 25,
        maxRange: 1,
        cameraSpecs: {
          resolution: '1080p',
          sensor: 'CMOS',
          iso: '100-800'
        }
      }
    ];

    for (const drone of drones) {
      // Trouver la catégorie
      const category = createdCategories.find(cat => cat.slug === drone.categorySlug);
      if (!category) continue;

      const slug = createSlug(`${drone.brand}-${drone.model}`);
      
      await sql`
        INSERT INTO drones (
          name, slug, description, brand, model, price, category_id,
          images, specifications, features, stock_quantity, weight,
          dimensions, battery_life, max_speed, max_range, camera_specs
        )
        VALUES (
          ${drone.name}, ${slug}, ${drone.description}, ${drone.brand}, ${drone.model},
          ${drone.price}, ${category.id}, ${JSON.stringify(drone.images)},
          ${JSON.stringify(drone.specifications)}, ${JSON.stringify(drone.features)},
          ${drone.stockQuantity}, ${drone.weight}, ${JSON.stringify(drone.dimensions)},
          ${drone.batteryLife}, ${drone.maxSpeed}, ${drone.maxRange},
          ${JSON.stringify(drone.cameraSpecs)}
        )
        ON CONFLICT (slug) DO UPDATE SET
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          stock_quantity = EXCLUDED.stock_quantity
      `;
    }

    console.log('✅ Drones créés');

    console.log('🎉 Seeding terminé avec succès !');
    console.log('📧 Admin: admin@droneshop.com / Admin123!');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
};

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
