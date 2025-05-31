const express = require('express');
const { sql } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, categorySchemas, uuidSchema } = require('../middleware/validation');

const router = express.Router();

// Fonction utilitaire pour créer un slug unique
const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// @route   GET /api/categories
// @desc    Obtenir toutes les catégories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { includeInactive = 'false' } = req.query;

    let whereClause = '';
    if (includeInactive !== 'true') {
      whereClause = 'WHERE is_active = true';
    }

    let categories;
    if (includeInactive !== 'true') {
      categories = await sql`
        SELECT
          id,
          name,
          slug,
          description,
          image_url,
          is_active,
          created_at,
          updated_at,
          (SELECT COUNT(*) FROM drones WHERE category_id = categories.id AND is_active = true) as drone_count
        FROM categories
        WHERE is_active = true
        ORDER BY name ASC
      `;
    } else {
      categories = await sql`
        SELECT
          id,
          name,
          slug,
          description,
          image_url,
          is_active,
          created_at,
          updated_at,
          (SELECT COUNT(*) FROM drones WHERE category_id = categories.id AND is_active = true) as drone_count
        FROM categories
        ORDER BY name ASC
      `;
    }

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.image_url,
      isActive: category.is_active,
      droneCount: parseInt(category.drone_count),
      createdAt: category.created_at,
      updatedAt: category.updated_at
    }));

    res.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Obtenir une catégorie par ID
// @access  Public
router.get('/:id', validate(uuidSchema, 'params'), async (req, res) => {
  try {
    const { id } = req.params;

    const categories = await sql`
      SELECT
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        created_at,
        updated_at
      FROM categories
      WHERE id = ${id}
    `;

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    const category = categories[0];

    // Obtenir le nombre de drones dans cette catégorie
    const droneCount = await sql`
      SELECT COUNT(*) as count
      FROM drones
      WHERE category_id = ${id} AND is_active = true
    `;

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.image_url,
      isActive: category.is_active,
      droneCount: parseInt(droneCount[0].count),
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };

    res.json({
      success: true,
      data: {
        category: formattedCategory
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie'
    });
  }
});

// @route   POST /api/categories
// @desc    Créer une nouvelle catégorie
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), validate(categorySchemas.create), async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    // Créer un slug unique
    let slug = createSlug(name);

    // Vérifier si le slug existe déjà
    const existingSlugs = await sql`
      SELECT slug FROM categories WHERE slug = ${slug}
    `;

    if (existingSlugs.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // Créer la catégorie
    const newCategories = await sql`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (${name}, ${slug}, ${description || null}, ${imageUrl || null})
      RETURNING *
    `;

    const category = newCategories[0];

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.image_url,
      isActive: category.is_active,
      droneCount: 0,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: {
        category: formattedCategory
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Mettre à jour une catégorie
// @access  Private (Admin only)
router.put('/:id', authenticate, authorize('admin'), validate(uuidSchema, 'params'), validate(categorySchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, isActive } = req.body;

    // Vérifier si la catégorie existe
    const existingCategories = await sql`
      SELECT * FROM categories WHERE id = ${id}
    `;

    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Préparer les champs à mettre à jour
    const updateFields = {};
    if (name !== undefined) {
      updateFields.name = name;
      updateFields.slug = createSlug(name);
    }
    if (description !== undefined) updateFields.description = description;
    if (imageUrl !== undefined) updateFields.image_url = imageUrl;
    if (isActive !== undefined) updateFields.is_active = isActive;

    // Si on change le nom, vérifier l'unicité du slug
    if (updateFields.slug) {
      const existingSlugs = await sql`
        SELECT slug FROM categories WHERE slug = ${updateFields.slug} AND id != ${id}
      `;

      if (existingSlugs.length > 0) {
        updateFields.slug = `${updateFields.slug}-${Date.now()}`;
      }
    }

    // Construire la requête de mise à jour
    const setClause = Object.keys(updateFields).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updateFields)];

    const updatedCategories = await sql.unsafe(`
      UPDATE categories
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, values);

    const category = updatedCategories[0];

    // Obtenir le nombre de drones
    const droneCount = await sql`
      SELECT COUNT(*) as count
      FROM drones
      WHERE category_id = ${id} AND is_active = true
    `;

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.image_url,
      isActive: category.is_active,
      droneCount: parseInt(droneCount[0].count),
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: {
        category: formattedCategory
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie'
    });
  }
});

module.exports = router;
