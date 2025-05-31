# 📚 Documentation API DroneDelivery

## 🚀 Vue d'ensemble

Cette documentation présente les améliorations apportées au projet DroneDelivery :

1. **Variables d'environnement complètes**
2. **Documentation API avec Swagger/OpenAPI**
3. **Tests unitaires et d'intégration**

## 🔧 Variables d'environnement

### Configuration Backend

Les variables d'environnement sont organisées par catégorie dans `.env` :

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos vraies valeurs
nano .env
```

#### Variables essentielles à configurer :

```env
# Base de données (OBLIGATOIRE)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT (OBLIGATOIRE - Changez en production !)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars

# Stripe (pour les paiements)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Cloudinary (pour les images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Configuration Frontend

Variables disponibles dans le frontend :

```env
# API Backend
REACT_APP_API_URL=http://localhost:5000/api

# Stripe (clé publique uniquement)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Optionnel
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key
```

## 📖 Documentation API (Swagger)

### Accès à la documentation

Une fois le serveur démarré :

```bash
cd backend
npm run dev
```

Accédez à la documentation interactive :
- **Interface Swagger UI** : http://localhost:5000/api/docs
- **Spécification JSON** : http://localhost:5000/api/docs.json

### Fonctionnalités de la documentation

- **Interface interactive** : Testez les API directement
- **Authentification** : Support JWT avec bouton "Authorize"
- **Schémas complets** : Modèles de données détaillés
- **Exemples** : Requêtes et réponses d'exemple
- **Codes d'erreur** : Documentation des erreurs possibles

### Utilisation de l'authentification

1. Créez un compte via `POST /api/auth/register`
2. Récupérez le token de la réponse
3. Cliquez sur "Authorize" en haut de la documentation
4. Entrez : `Bearer votre_token_jwt`
5. Testez les routes protégées

## 🧪 Tests

### Structure des tests

```
backend/tests/
├── setup.js              # Configuration globale
├── utils/
│   └── database.js        # Utilitaires pour les tests DB
├── unit/
│   └── utils.test.js      # Tests unitaires
└── integration/
    ├── auth.test.js       # Tests d'authentification
    └── drones.test.js     # Tests des drones
```

### Commandes de test

```bash
cd backend

# Tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests d'intégration uniquement
npm run test:integration

# Tests unitaires uniquement
npm run test:unit
```

### Configuration des tests

Les tests utilisent :
- **Jest** : Framework de test
- **Supertest** : Tests d'API HTTP
- **Base de données** : Même instance que le dev (nettoyée entre tests)
- **Mocks** : Services externes (Cloudinary, Email)

### Variables de test

Fichier `.env.test` avec des valeurs sécurisées pour les tests :

```env
NODE_ENV=test
JWT_SECRET=test_jwt_secret_for_testing_only
DATABASE_URL=your_test_database_url
```

### Exemples de tests

#### Test d'authentification
```javascript
it('devrait créer un nouvel utilisateur', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe'
    })
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.token).toBeDefined();
});
```

#### Test de drone
```javascript
it('devrait retourner la liste des drones', async () => {
  const response = await request(app)
    .get('/api/drones')
    .expect(200);

  expect(response.body.data.drones).toBeInstanceOf(Array);
  expect(response.body.data.pagination).toBeDefined();
});
```

## 🛠️ Utilisation en développement

### Démarrage complet

```bash
# 1. Configuration backend
cd backend
cp .env.example .env
# Éditer .env avec vos vraies valeurs
npm install
npm run dev

# 2. Dans un autre terminal - Frontend
cd frontend
npm install
npm start

# 3. Dans un autre terminal - Tests (optionnel)
cd backend
npm run test:watch
```

### Workflow de développement

1. **Développer** : Modifiez le code
2. **Tester** : Lancez `npm test` pour vérifier
3. **Documenter** : Ajoutez les annotations Swagger pour les nouvelles routes
4. **Valider** : Vérifiez la documentation sur `/api/docs`

### Ajout de nouvelles routes

Pour ajouter une nouvelle route avec documentation :

```javascript
/**
 * @swagger
 * /api/nouvelle-route:
 *   post:
 *     summary: Description de la route
 *     tags: [TagName]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       201:
 *         description: Succès
 */
router.post('/nouvelle-route', async (req, res) => {
  // Implémentation
});
```

## 🔒 Sécurité

### Variables sensibles

⚠️ **IMPORTANT** : Changez ces valeurs en production :

- `JWT_SECRET` : Minimum 32 caractères aléatoires
- `DATABASE_URL` : Connexion sécurisée
- Clés Stripe, Cloudinary, etc.

### Fichiers à ignorer

Assurez-vous que `.env` est dans `.gitignore` :

```gitignore
# Variables d'environnement
.env
.env.local
.env.production

# Tests
coverage/
*.log
```

## 📊 Monitoring et Métriques

### Couverture de tests

Après `npm run test:coverage`, consultez :
- **Terminal** : Résumé de couverture
- **coverage/lcov-report/index.html** : Rapport détaillé

### Métriques recommandées

- **Couverture** : > 80%
- **Tests** : Tous passants
- **Documentation** : Routes complètes

## 🚀 Déploiement

### Variables de production

```env
NODE_ENV=production
JWT_SECRET=very_long_random_string_minimum_32_characters
DATABASE_URL=postgresql://prod_user:strong_password@host/prod_db

# URLs de production
CLIENT_URL=https://votre-domain.com
SERVER_URL=https://api.votre-domain.com
```

### Commandes de production

```bash
# Tests avant déploiement
npm run test:coverage

# Démarrage production
npm start
```

Cette documentation couvre les trois améliorations majeures apportées à votre projet. Chaque section peut être utilisée indépendamment selon vos besoins !
