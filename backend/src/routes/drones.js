const express = require('express');
const { sql } = require('../config/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, droneSchemas, uuidSchema } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Drones
 *   description: Gestion du catalogue de drones
 */

/**
 * @swagger
 * tags:
 *   name: Drones
 *   description: Gestion du catalogue de drones
 */

// Fonction utilitaire pour créer un slug unique
const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// @route   GET /api/drones
// @desc    Obtenir tous les drones avec filtres et pagination
// @access  Public
/**
 * @swagger
 * /api/drones:
 *   get:
 *     summary: Récupérer la liste des drones avec filtres et pagination
 *     tags: [Drones]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filtrer par marque
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, price, rating, name]
 *           default: created_at
 *         description: Critère de tri
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des drones récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     drones:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Drone'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      brand = '',
      minPrice = 0,
      maxPrice = 999999,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      inStock = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construire la requête avec filtres dynamiques
    let drones;
    let countResult;

    // Requête de base sans filtres
    if (!search && !category && !brand && parseFloat(minPrice) <= 0 && parseFloat(maxPrice) >= 999999 && inStock !== 'true') {
      // Cas simple sans filtres
      drones = await sql`
        SELECT
          d.id,
          d.name,
          d.slug,
          d.description,
          d.brand,
          d.model,
          d.price,
          d.images,
          d.specifications,
          d.features,
          d.stock_quantity,
          d.rating,
          d.review_count,
          d.weight,
          d.dimensions,
          d.battery_life,
          d.max_speed,
          d.max_range,
          d.camera_specs,
          d.created_at,
          c.id as category_id,
          c.name as category_name,
          c.slug as category_slug
        FROM drones d
        LEFT JOIN categories c ON d.category_id = c.id
        WHERE d.is_active = true
        ORDER BY d.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as total
        FROM drones d
        WHERE d.is_active = true
      `;
    } else {
      // Cas avec filtres - utilisons une approche plus simple
      if (search) {
        drones = await sql`
          SELECT
            d.id,
            d.name,
            d.slug,
            d.description,
            d.brand,
            d.model,
            d.price,
            d.images,
            d.specifications,
            d.features,
            d.stock_quantity,
            d.rating,
            d.review_count,
            d.weight,
            d.dimensions,
            d.battery_life,
            d.max_speed,
            d.max_range,
            d.camera_specs,
            d.created_at,
            c.id as category_id,
            c.name as category_name,
            c.slug as category_slug
          FROM drones d
          LEFT JOIN categories c ON d.category_id = c.id
          WHERE d.is_active = true
            AND (d.name ILIKE ${`%${search}%`} OR d.description ILIKE ${`%${search}%`} OR d.brand ILIKE ${`%${search}%`})
          ORDER BY d.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;

        countResult = await sql`
          SELECT COUNT(*) as total
          FROM drones d
          WHERE d.is_active = true
            AND (d.name ILIKE ${`%${search}%`} OR d.description ILIKE ${`%${search}%`} OR d.brand ILIKE ${`%${search}%`})
        `;
      } else if (parseFloat(minPrice) > 0 || parseFloat(maxPrice) < 999999) {
        // Filtres de prix
        drones = await sql`
          SELECT
            d.id,
            d.name,
            d.slug,
            d.description,
            d.brand,
            d.model,
            d.price,
            d.images,
            d.specifications,
            d.features,
            d.stock_quantity,
            d.rating,
            d.review_count,
            d.weight,
            d.dimensions,
            d.battery_life,
            d.max_speed,
            d.max_range,
            d.camera_specs,
            d.created_at,
            c.id as category_id,
            c.name as category_name,
            c.slug as category_slug
          FROM drones d
          LEFT JOIN categories c ON d.category_id = c.id
          WHERE d.is_active = true
            AND d.price >= ${parseFloat(minPrice)}
            AND d.price <= ${parseFloat(maxPrice)}
          ORDER BY d.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;

        countResult = await sql`
          SELECT COUNT(*) as total
          FROM drones d
          WHERE d.is_active = true
            AND d.price >= ${parseFloat(minPrice)}
            AND d.price <= ${parseFloat(maxPrice)}
        `;
      } else {
        // Requête par défaut avec d'autres filtres
        drones = await sql`
          SELECT
            d.id,
            d.name,
            d.slug,
            d.description,
            d.brand,
            d.model,
            d.price,
            d.images,
            d.specifications,
            d.features,
            d.stock_quantity,
            d.rating,
            d.review_count,
            d.weight,
            d.dimensions,
            d.battery_life,
            d.max_speed,
            d.max_range,
            d.camera_specs,
            d.created_at,
            c.id as category_id,
            c.name as category_name,
            c.slug as category_slug
          FROM drones d
          LEFT JOIN categories c ON d.category_id = c.id
          WHERE d.is_active = true
          ORDER BY d.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;

        countResult = await sql`
          SELECT COUNT(*) as total
          FROM drones d
          WHERE d.is_active = true
        `;
      }
    }
    const total = parseInt(countResult[0].total);

    // Formatage des données
    const formattedDrones = drones.map(drone => ({
      id: drone.id,
      name: drone.name,
      slug: drone.slug,
      description: drone.description,
      brand: drone.brand,
      model: drone.model,
      price: parseFloat(drone.price),
      images: drone.images || [],
      specifications: drone.specifications || {},
      features: drone.features || [],
      inStock: drone.stock_quantity > 0,
      stockQuantity: drone.stock_quantity,
      rating: parseFloat(drone.rating) || 0,
      reviewCount: drone.review_count || 0,
      weight: parseFloat(drone.weight) || null,
      dimensions: drone.dimensions || {},
      batteryLife: drone.battery_life,
      maxSpeed: drone.max_speed,
      maxRange: drone.max_range,
      cameraSpecs: drone.camera_specs || {},
      category: drone.category_id ? {
        id: drone.category_id,
        name: drone.category_name,
        slug: drone.category_slug
      } : null,
      createdAt: drone.created_at
    }));

    res.json({
      success: true,
      data: {
        drones: formattedDrones,
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
    console.error('Erreur lors de la récupération des drones:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des drones'
    });
  }
});

// @route   GET /api/drones/:id
// @desc    Obtenir un drone par ID
// @access  Public
router.get('/:id', validate(uuidSchema, 'params'), optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const drones = await sql`
      SELECT
        d.*,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM drones d
      LEFT JOIN categories c ON d.category_id = c.id
      WHERE d.id = ${id} AND d.is_active = true
    `;

    if (drones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone non trouvé'
      });
    }

    const drone = drones[0];

    const formattedDrone = {
      id: drone.id,
      name: drone.name,
      slug: drone.slug,
      description: drone.description,
      brand: drone.brand,
      model: drone.model,
      price: parseFloat(drone.price),
      images: drone.images || [],
      specifications: drone.specifications || {},
      features: drone.features || [],
      inStock: drone.stock_quantity > 0,
      stockQuantity: drone.stock_quantity,
      rating: parseFloat(drone.rating) || 0,
      reviewCount: drone.review_count || 0,
      weight: parseFloat(drone.weight) || null,
      dimensions: drone.dimensions || {},
      batteryLife: drone.battery_life,
      maxSpeed: drone.max_speed,
      maxRange: drone.max_range,
      cameraSpecs: drone.camera_specs || {},
      category: drone.category_id ? {
        id: drone.category_id,
        name: drone.category_name,
        slug: drone.category_slug
      } : null,
      createdAt: drone.created_at,
      updatedAt: drone.updated_at
    };

    res.json({
      success: true,
      data: {
        drone: formattedDrone
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du drone:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du drone'
    });
  }
});

// @route   POST /api/drones
// @desc    Créer un nouveau drone (Admin seulement)
// @access  Private/Admin
/**
 * @swagger
 * /api/drones:
 *   post:
 *     summary: Créer un nouveau drone
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DroneInput'
 *     responses:
 *       201:
 *         description: Drone créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     drone:
 *                       $ref: '#/components/schemas/Drone'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Privilèges administrateur requis
 */
router.post('/', authenticate, authorize('admin'), validate(droneSchemas.create), async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      model,
      price,
      categoryId,
      images = [],
      specifications = {},
      features = [],
      stockQuantity = 0,
      weight,
      dimensions = {},
      batteryLife,
      maxSpeed,
      maxRange,
      cameraSpecs = {}
    } = req.body;

    // Créer un slug unique
    const baseSlug = createSlug(`${brand} ${model}`);
    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité du slug
    while (true) {
      const existingDrone = await sql`
        SELECT id FROM drones WHERE slug = ${slug}
      `;
      if (existingDrone.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Insérer le nouveau drone
    const [newDrone] = await sql`
      INSERT INTO drones (
        name, slug, description, brand, model, price, category_id,
        images, specifications, features, stock_quantity, weight,
        dimensions, battery_life, max_speed, max_range, camera_specs
      ) VALUES (
        ${name}, ${slug}, ${description}, ${brand}, ${model}, ${price}, ${categoryId},
        ${JSON.stringify(images)}, ${JSON.stringify(specifications)}, ${JSON.stringify(features)},
        ${stockQuantity}, ${weight}, ${JSON.stringify(dimensions)}, ${batteryLife},
        ${maxSpeed}, ${maxRange}, ${JSON.stringify(cameraSpecs)}
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Drone créé avec succès',
      data: {
        drone: {
          id: newDrone.id,
          name: newDrone.name,
          slug: newDrone.slug,
          description: newDrone.description,
          brand: newDrone.brand,
          model: newDrone.model,
          price: parseFloat(newDrone.price),
          categoryId: newDrone.category_id,
          images: newDrone.images || [],
          specifications: newDrone.specifications || {},
          features: newDrone.features || [],
          stockQuantity: newDrone.stock_quantity,
          weight: parseFloat(newDrone.weight) || null,
          dimensions: newDrone.dimensions || {},
          batteryLife: newDrone.battery_life,
          maxSpeed: newDrone.max_speed,
          maxRange: newDrone.max_range,
          cameraSpecs: newDrone.camera_specs || {},
          createdAt: newDrone.created_at
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du drone:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du drone'
    });
  }
});

// @route   PUT /api/drones/:id
// @desc    Mettre à jour un drone (Admin seulement)
// @access  Private/Admin
/**
 * @swagger
 * /api/drones/{id}:
 *   put:
 *     summary: Mettre à jour un drone
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du drone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DroneInput'
 *     responses:
 *       200:
 *         description: Drone mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Privilèges administrateur requis
 *       404:
 *         description: Drone non trouvé
 */
router.put('/:id', authenticate, authorize('admin'), validate(uuidSchema, 'params'), validate(droneSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que le drone existe
    const existingDrone = await sql`
      SELECT * FROM drones WHERE id = ${id}
    `;

    if (existingDrone.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone non trouvé'
      });
    }

    // Si le nom ou le modèle change, recréer le slug
    let slug = existingDrone[0].slug;
    if (updateData.name || updateData.model || updateData.brand) {
      const brand = updateData.brand || existingDrone[0].brand;
      const model = updateData.model || existingDrone[0].model;
      const baseSlug = createSlug(`${brand} ${model}`);
      
      if (baseSlug !== existingDrone[0].slug) {
        slug = baseSlug;
        let counter = 1;
        
        while (true) {
          const duplicateSlug = await sql`
            SELECT id FROM drones WHERE slug = ${slug} AND id != ${id}
          `;
          if (duplicateSlug.length === 0) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
    }

    // Mettre à jour le drone avec une requête simplifiée
    const [updatedDrone] = await sql`
      UPDATE drones 
      SET 
        name = COALESCE(${updateData.name}, name),
        description = COALESCE(${updateData.description}, description),
        brand = COALESCE(${updateData.brand}, brand),
        model = COALESCE(${updateData.model}, model),
        price = COALESCE(${updateData.price}, price),
        category_id = COALESCE(${updateData.categoryId}, category_id),
        stock_quantity = COALESCE(${updateData.stockQuantity}, stock_quantity),
        weight = COALESCE(${updateData.weight}, weight),
        battery_life = COALESCE(${updateData.batteryLife}, battery_life),
        max_speed = COALESCE(${updateData.maxSpeed}, max_speed),
        max_range = COALESCE(${updateData.maxRange}, max_range),
        images = COALESCE(${updateData.images ? JSON.stringify(updateData.images) : null}, images),
        specifications = COALESCE(${updateData.specifications ? JSON.stringify(updateData.specifications) : null}, specifications),
        features = COALESCE(${updateData.features ? JSON.stringify(updateData.features) : null}, features),
        dimensions = COALESCE(${updateData.dimensions ? JSON.stringify(updateData.dimensions) : null}, dimensions),
        camera_specs = COALESCE(${updateData.cameraSpecs ? JSON.stringify(updateData.cameraSpecs) : null}, camera_specs),
        slug = ${slug},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Drone mis à jour avec succès',
      data: {
        drone: {
          id: updatedDrone.id,
          name: updatedDrone.name,
          slug: updatedDrone.slug,
          description: updatedDrone.description,
          brand: updatedDrone.brand,
          model: updatedDrone.model,
          price: parseFloat(updatedDrone.price),
          categoryId: updatedDrone.category_id,
          images: updatedDrone.images || [],
          specifications: updatedDrone.specifications || {},
          features: updatedDrone.features || [],
          stockQuantity: updatedDrone.stock_quantity,
          weight: parseFloat(updatedDrone.weight) || null,
          dimensions: updatedDrone.dimensions || {},
          batteryLife: updatedDrone.battery_life,
          maxSpeed: updatedDrone.max_speed,
          maxRange: updatedDrone.max_range,
          cameraSpecs: updatedDrone.camera_specs || {},
          updatedAt: updatedDrone.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du drone:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du drone'
    });
  }
});

// @route   DELETE /api/drones/:id
// @desc    Supprimer un drone (Admin seulement)
// @access  Private/Admin
/**
 * @swagger
 * /api/drones/{id}:
 *   delete:
 *     summary: Supprimer un drone
 *     tags: [Drones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du drone
 *     responses:
 *       200:
 *         description: Drone supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Privilèges administrateur requis
 *       404:
 *         description: Drone non trouvé
 */
router.delete('/:id', authenticate, authorize('admin'), validate(uuidSchema, 'params'), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le drone existe
    const existingDrone = await sql`
      SELECT id FROM drones WHERE id = ${id}
    `;

    if (existingDrone.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone non trouvé'
      });
    }

    // Supprimer le drone
    await sql`
      DELETE FROM drones WHERE id = ${id}
    `;

    res.json({
      success: true,
      message: 'Drone supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du drone:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du drone'
    });
  }
});

module.exports = router;
