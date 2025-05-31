const Joi = require('joi');

// Middleware de validation générique
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Erreur de validation: ${message}`
      });
    }
    
    next();
  };
};

// Schémas de validation pour l'authentification
const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    }),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
      'any.required': 'Mot de passe requis'
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Le prénom doit contenir au moins 2 caractères',
      'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
      'any.required': 'Prénom requis'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 50 caractères',
      'any.required': 'Nom requis'
    }),
    phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional().messages({
      'string.pattern.base': 'Numéro de téléphone invalide'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Mot de passe requis'
    })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Token requis'
    }),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial',
      'any.required': 'Mot de passe requis'
    })
  })
};

// Schémas de validation pour les drones
const droneSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(2000).optional(),
    brand: Joi.string().min(2).max(100).required(),
    model: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    categoryId: Joi.string().uuid().required(),
    specifications: Joi.object().optional(),
    features: Joi.array().items(Joi.string()).optional(),
    stockQuantity: Joi.number().integer().min(0).default(0),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.object().optional(),
    batteryLife: Joi.number().integer().positive().optional(),
    maxSpeed: Joi.number().integer().positive().optional(),
    maxRange: Joi.number().integer().positive().optional(),
    cameraSpecs: Joi.object().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(2000).optional(),
    brand: Joi.string().min(2).max(100).optional(),
    model: Joi.string().min(2).max(100).optional(),
    price: Joi.number().positive().precision(2).optional(),
    categoryId: Joi.string().uuid().optional(),
    specifications: Joi.object().optional(),
    features: Joi.array().items(Joi.string()).optional(),
    stockQuantity: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional(),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.object().optional(),
    batteryLife: Joi.number().integer().positive().optional(),
    maxSpeed: Joi.number().integer().positive().optional(),
    maxRange: Joi.number().integer().positive().optional(),
    cameraSpecs: Joi.object().optional()
  })
};

// Schémas de validation pour les catégories
const categorySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    imageUrl: Joi.string().uri().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    imageUrl: Joi.string().uri().optional(),
    isActive: Joi.boolean().optional()
  })
};

// Validation des paramètres UUID
const uuidSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'ID invalide',
    'any.required': 'ID requis'
  })
});

module.exports = {
  validate,
  authSchemas,
  droneSchemas,
  categorySchemas,
  uuidSchema
};
