// Middleware de gestion d'erreurs centralisé
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  console.error('❌ Erreur:', err);

  // Erreur de validation Joi
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = {
      statusCode: 400,
      message: `Erreur de validation: ${message}`
    };
  }

  // Erreur de base de données PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Violation de contrainte unique
        error = {
          statusCode: 400,
          message: 'Cette ressource existe déjà'
        };
        break;
      case '23503': // Violation de clé étrangère
        error = {
          statusCode: 400,
          message: 'Référence invalide'
        };
        break;
      case '23502': // Violation de contrainte NOT NULL
        error = {
          statusCode: 400,
          message: 'Champ requis manquant'
        };
        break;
      default:
        error = {
          statusCode: 500,
          message: 'Erreur de base de données'
        };
    }
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token invalide'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expiré'
    };
  }

  // Erreur de cast (ID invalide)
  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: 'ID invalide'
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
