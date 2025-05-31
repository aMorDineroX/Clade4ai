const express = require('express');
const { sql } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, uuidSchema } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Schéma de validation pour créer un avis
const createReviewSchema = Joi.object({
  droneId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().min(3).max(100).required(),
  comment: Joi.string().min(10).max(1000).required()
});

// @route   POST /api/reviews
// @desc    Créer un nouvel avis
// @access  Private
router.post('/', authenticate, validate(createReviewSchema), async (req, res) => {
  try {
    const { droneId, rating, title, comment } = req.body;
    const userId = req.user.id;

    // Vérifier si le drone existe
    const drones = await sql`
      SELECT id, name FROM drones WHERE id = ${droneId} AND is_active = true
    `;

    if (drones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone non trouvé'
      });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce drone
    const existingReviews = await sql`
      SELECT id FROM reviews WHERE user_id = ${userId} AND drone_id = ${droneId}
    `;

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour ce drone'
      });
    }

    // Créer l'avis
    const newReviews = await sql`
      INSERT INTO reviews (user_id, drone_id, rating, title, comment)
      VALUES (${userId}, ${droneId}, ${rating}, ${title}, ${comment})
      RETURNING *
    `;

    const review = newReviews[0];

    // Mettre à jour la note moyenne et le nombre d'avis du drone
    const ratingStats = await sql`
      SELECT 
        AVG(rating)::DECIMAL(3,2) as avg_rating,
        COUNT(*) as review_count
      FROM reviews 
      WHERE drone_id = ${droneId} AND is_approved = true
    `;

    await sql`
      UPDATE drones 
      SET 
        rating = ${ratingStats[0].avg_rating},
        review_count = ${ratingStats[0].review_count},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${droneId}
    `;

    // Récupérer les informations de l'utilisateur pour la réponse
    const users = await sql`
      SELECT first_name, last_name FROM users WHERE id = ${userId}
    `;

    const formattedReview = {
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isApproved: review.is_approved,
      user: {
        firstName: users[0].first_name,
        lastName: users[0].last_name
      },
      drone: {
        id: drones[0].id,
        name: drones[0].name
      },
      createdAt: review.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: {
        review: formattedReview
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis'
    });
  }
});

// @route   GET /api/reviews/drone/:droneId
// @desc    Obtenir tous les avis d'un drone
// @access  Public
router.get('/drone/:droneId', validate(uuidSchema, 'params'), optionalAuth, async (req, res) => {
  try {
    const { droneId } = req.params;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Vérifier si le drone existe
    const drones = await sql`
      SELECT id, name FROM drones WHERE id = ${droneId} AND is_active = true
    `;

    if (drones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone non trouvé'
      });
    }

    // Validation du tri
    const validSortFields = ['rating', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Requête pour obtenir les avis
    const reviewsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.title,
        r.comment,
        r.is_approved,
        r.created_at,
        u.first_name,
        u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.drone_id = $1 AND r.is_approved = true
      ORDER BY r.${finalSortBy} ${finalSortOrder}
      LIMIT $2 OFFSET $3
    `;

    const reviews = await sql.unsafe(reviewsQuery, [droneId, parseInt(limit), offset]);

    // Requête pour obtenir le nombre total
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM reviews
      WHERE drone_id = ${droneId} AND is_approved = true
    `;

    const total = parseInt(countResult[0].total);

    // Statistiques des notes
    const ratingStats = await sql`
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE drone_id = ${droneId} AND is_approved = true
      GROUP BY rating
      ORDER BY rating DESC
    `;

    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    ratingStats.forEach(stat => {
      ratingDistribution[stat.rating] = parseInt(stat.count);
    });

    // Formatage des données
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      user: {
        firstName: review.first_name,
        lastName: review.last_name
      },
      createdAt: review.created_at
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        statistics: {
          totalReviews: total,
          ratingDistribution
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis'
    });
  }
});

// @route   GET /api/reviews/user
// @desc    Obtenir tous les avis de l'utilisateur connecté
// @access  Private
router.get('/user', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;

    // Requête pour obtenir les avis de l'utilisateur
    const reviews = await sql`
      SELECT 
        r.id,
        r.rating,
        r.title,
        r.comment,
        r.is_approved,
        r.created_at,
        r.updated_at,
        d.id as drone_id,
        d.name as drone_name,
        d.images
      FROM reviews r
      JOIN drones d ON r.drone_id = d.id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `;

    // Requête pour obtenir le nombre total
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM reviews
      WHERE user_id = ${userId}
    `;

    const total = parseInt(countResult[0].total);

    // Formatage des données
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isApproved: review.is_approved,
      drone: {
        id: review.drone_id,
        name: review.drone_name,
        image: review.images && review.images.length > 0 ? review.images[0] : null
      },
      createdAt: review.created_at,
      updatedAt: review.updated_at
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des avis utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis'
    });
  }
});

module.exports = router;
