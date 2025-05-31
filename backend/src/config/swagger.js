const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DroneDelivery API',
    version: '1.0.0',
    description: `
      ## 🚁 API de l'application DroneDelivery
      
      Cette API permet de gérer une plateforme de vente de drones de livraison.
      
      ### Fonctionnalités principales:
      - 👤 Authentification et gestion des utilisateurs
      - 🚁 Gestion du catalogue de drones
      - 🛒 Système de panier et commandes
      - ⭐ Système d'avis et de notes
      - 📦 Gestion des catégories
      
      ### Authentification
      L'API utilise JWT (JSON Web Tokens) pour l'authentification.
      Incluez le token dans l'en-tête Authorization: \`Bearer <token>\`
    `,
    contact: {
      name: 'Support DroneDelivery',
      email: 'support@dronedelivery.com',
      url: 'https://dronedelivery.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Serveur de développement'
    },
    {
      url: 'https://api.dronedelivery.com',
      description: 'Serveur de production'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre token JWT dans le format: Bearer <token>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID unique de l\'utilisateur'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email unique'
          },
          firstName: {
            type: 'string',
            description: 'Prénom'
          },
          lastName: {
            type: 'string',
            description: 'Nom de famille'
          },
          phone: {
            type: 'string',
            description: 'Numéro de téléphone'
          },
          role: {
            type: 'string',
            enum: ['customer', 'admin'],
            description: 'Rôle de l\'utilisateur'
          },
          isVerified: {
            type: 'boolean',
            description: 'Statut de vérification du compte'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Drone: {
        type: 'object',
        required: ['name', 'brand', 'model', 'price'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string',
            description: 'Nom du drone'
          },
          slug: {
            type: 'string',
            description: 'Slug unique pour l\'URL'
          },
          description: {
            type: 'string',
            description: 'Description détaillée'
          },
          brand: {
            type: 'string',
            description: 'Marque du drone'
          },
          model: {
            type: 'string',
            description: 'Modèle du drone'
          },
          price: {
            type: 'number',
            format: 'decimal',
            description: 'Prix en euros'
          },
          categoryId: {
            type: 'string',
            format: 'uuid',
            description: 'ID de la catégorie'
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'url'
            },
            description: 'URLs des images'
          },
          specifications: {
            type: 'object',
            description: 'Spécifications techniques'
          },
          features: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Caractéristiques principales'
          },
          stockQuantity: {
            type: 'integer',
            description: 'Quantité en stock'
          },
          isActive: {
            type: 'boolean',
            description: 'Statut actif/inactif'
          },
          rating: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            maximum: 5,
            description: 'Note moyenne'
          },
          reviewCount: {
            type: 'integer',
            description: 'Nombre d\'avis'
          },
          weight: {
            type: 'number',
            description: 'Poids en kg'
          },
          batteryLife: {
            type: 'integer',
            description: 'Autonomie en minutes'
          },
          maxSpeed: {
            type: 'integer',
            description: 'Vitesse max en km/h'
          },
          maxRange: {
            type: 'integer',
            description: 'Portée max en mètres'
          }
        }
      },
      Category: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string',
            description: 'Nom de la catégorie'
          },
          slug: {
            type: 'string',
            description: 'Slug unique pour l\'URL'
          },
          description: {
            type: 'string',
            description: 'Description de la catégorie'
          },
          imageUrl: {
            type: 'string',
            format: 'url',
            description: 'URL de l\'image'
          },
          isActive: {
            type: 'boolean',
            description: 'Statut actif/inactif'
          }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          userId: {
            type: 'string',
            format: 'uuid'
          },
          totalAmount: {
            type: 'number',
            format: 'decimal'
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
          },
          paymentMethod: {
            type: 'string',
            enum: ['card', 'paypal']
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'completed', 'failed', 'refunded']
          },
          shippingAddress: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              postalCode: { type: 'string' },
              country: { type: 'string' }
            }
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                droneId: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer' },
                price: { type: 'number', format: 'decimal' }
              }
            }
          },
          trackingNumber: {
            type: 'string'
          }
        }
      },
      Review: {
        type: 'object',
        required: ['rating', 'title', 'comment'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          userId: {
            type: 'string',
            format: 'uuid'
          },
          droneId: {
            type: 'string',
            format: 'uuid'
          },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: 'Note de 1 à 5 étoiles'
          },
          title: {
            type: 'string',
            description: 'Titre de l\'avis'
          },
          comment: {
            type: 'string',
            description: 'Commentaire détaillé'
          },
          isApproved: {
            type: 'boolean',
            description: 'Statut d\'approbation'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Message d\'erreur'
          },
          code: {
            type: 'string',
            description: 'Code d\'erreur'
          },
          details: {
            type: 'object',
            description: 'Détails supplémentaires'
          }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Token d\'authentification manquant ou invalide',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      Forbidden: {
        description: 'Accès interdit - permissions insuffisantes',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      NotFound: {
        description: 'Ressource introuvable',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      ValidationError: {
        description: 'Erreur de validation des données',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options pour swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.js', // Chemins vers les fichiers contenant les annotations
    './src/controllers/*.js'
  ]
};

// Génération de la spécification Swagger
const swaggerSpec = swaggerJSDoc(options);

// Configuration personnalisée de l'interface Swagger UI
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3B82F6 }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'DroneDelivery API Documentation',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
  swaggerUi
};
