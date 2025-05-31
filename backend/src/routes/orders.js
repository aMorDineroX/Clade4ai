const express = require('express');
const { sql } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, uuidSchema } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Schéma de validation pour créer une commande
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      droneId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
    phone: Joi.string().optional()
  }).required(),
  paymentMethod: Joi.string().valid('card', 'paypal').required()
});

// @route   POST /api/orders
// @desc    Créer une nouvelle commande
// @access  Private
router.post('/', authenticate, validate(createOrderSchema), async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Vérifier la disponibilité des drones et calculer le total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const drones = await sql`
        SELECT id, name, price, stock_quantity
        FROM drones
        WHERE id = ${item.droneId} AND is_active = true
      `;

      if (drones.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Drone avec l'ID ${item.droneId} non trouvé`
        });
      }

      const drone = drones[0];

      if (drone.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour ${drone.name}. Stock disponible: ${drone.stock_quantity}`
        });
      }

      // Vérifier que le prix correspond
      if (parseFloat(drone.price) !== item.price) {
        return res.status(400).json({
          success: false,
          message: `Prix incorrect pour ${drone.name}`
        });
      }

      totalAmount += item.price * item.quantity;
      orderItems.push({
        droneId: item.droneId,
        droneName: drone.name,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Créer la commande
    const newOrders = await sql`
      INSERT INTO orders (
        user_id,
        total_amount,
        status,
        payment_method,
        shipping_address,
        items
      )
      VALUES (
        ${userId},
        ${totalAmount},
        'pending',
        ${paymentMethod},
        ${JSON.stringify(shippingAddress)},
        ${JSON.stringify(orderItems)}
      )
      RETURNING *
    `;

    const order = newOrders[0];

    // Mettre à jour le stock des drones
    for (const item of items) {
      await sql`
        UPDATE drones
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.droneId}
      `;
    }

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        order: {
          id: order.id,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          paymentMethod: order.payment_method,
          shippingAddress: order.shipping_address,
          items: order.items,
          createdAt: order.created_at
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande'
    });
  }
});

// @route   GET /api/orders
// @desc    Obtenir les commandes de l'utilisateur connecté
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;

    // Construction de la requête avec filtres
    let whereConditions = [`user_id = $1`];
    let params = [userId];

    if (status && ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Requête pour obtenir les commandes
    const ordersQuery = `
      SELECT *
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(parseInt(limit), offset);

    const orders = await sql.unsafe(ordersQuery, params);

    // Requête pour obtenir le nombre total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders
      ${whereClause}
    `;

    const countResult = await sql.unsafe(countQuery, params.slice(0, -2));
    const total = parseInt(countResult[0].total);

    // Formatage des données
    const formattedOrders = orders.map(order => ({
      id: order.id,
      totalAmount: parseFloat(order.total_amount),
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address,
      items: order.items,
      trackingNumber: order.tracking_number,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
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
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Obtenir une commande spécifique
// @access  Private
router.get('/:id', authenticate, validate(uuidSchema, 'params'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Les admins peuvent voir toutes les commandes, les utilisateurs seulement les leurs
    let whereClause = 'WHERE id = $1';
    let params = [id];

    if (req.user.role !== 'admin') {
      whereClause += ' AND user_id = $2';
      params.push(userId);
    }

    const orders = await sql.unsafe(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
    `, params);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const order = orders[0];

    const formattedOrder = {
      id: order.id,
      totalAmount: parseFloat(order.total_amount),
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address,
      items: order.items,
      trackingNumber: order.tracking_number,
      user: {
        firstName: order.first_name,
        lastName: order.last_name,
        email: order.email
      },
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };

    res.json({
      success: true,
      data: {
        order: formattedOrder
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande'
    });
  }
});

module.exports = router;
